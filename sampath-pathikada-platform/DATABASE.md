# Database

MySQL (8.x recommended; MariaDB 10.4+ has also been verified to work — see
Backup/Restore below), accessed exclusively through Prisma (`@prisma/client`
6.9.0). Schema source of truth: `prisma/schema.prisma`.

## Connection pooling

`lib/db.ts` uses the standard Prisma singleton pattern (survives Next.js dev
hot-reload without exhausting connections — see the comment in that file).

**Pool size is configured via `DATABASE_URL` query params**, not hardcoded in
application code:

```
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=10&pool_timeout=10"
```

Why this matters: without `connection_limit`, Prisma defaults to
`num_cpus * 2 + 1` connections **per running instance**. This app runs as a
single long-lived container (no horizontal scaling — see
[DEPLOYMENT.md](./DEPLOYMENT.md)), so today the calculation is simple:

```
1 instance × connection_limit  ≤  MySQL's max_connections
```

`connection_limit=10` (the value in `.env.example`) is a conservative starting
point, comfortably under stock MySQL 8's default `max_connections=151`. Raise
it only with evidence — check `SHOW STATUS LIKE 'Threads_connected'` and
`SHOW PROCESSLIST` on the DB server if you suspect requests are queuing on
pool exhaustion, don't raise it speculatively.

**If you ever scale to multiple instances**, the formula becomes
`instances × connection_limit ≤ max_connections`, and every instance's
`connection_limit` needs to shrink accordingly — this is exactly the kind of
change that's easy to forget when adding a second replica, so it's called out
explicitly here.

## Schema overview

9 models: `User`, `EconomicDevelopmentOfficerRegistration`,
`AssistantDirectorPlanningRegistration`, `DivisionalSecretariatRegistration`,
`AuditLog`, `Submission`, `DivisionProfile`, `SystemSetting`,
`PasswordResetOtp`. See `prisma/schema.prisma` for the authoritative field
list — it's well-commented in place, so this document doesn't duplicate every
field, only the operationally-relevant decisions:

- **Indexing is deliberate, not default.** Every FK has a matching `@@index`;
  filterable columns used in real `where` clauses (`status`, `district`,
  `dsDivision`, `year`, `role`, `email`) are indexed; `Submission` has a
  composite `@@index([reviewStage, status])` added specifically for the
  AD/DS review-queue query pattern. Before adding a new index, confirm which
  actual query it serves (check the relevant `app/api/**/route.ts` file's
  `where`/`orderBy`) — an unused index only adds write overhead.
- **Unique constraints enforce real business invariants at the DB level**, not
  just in application code: `User.email`, `User.nic` (nullable-unique),
  `Submission @@unique([submittedById, year])` (one submission per officer per
  reporting year), `DivisionProfile.gnDivision` / `.sourceSubmissionId` (one
  official profile per GN division).
- **`Submission.data` and `.sectionReviews` are `Json` columns** — the 15-section
  form and its per-section review state are stored unstructured, by design
  (the form's shape evolves faster than a rigid relational schema could track
  cheaply). The tradeoff: the database enforces no structure on this data: a
  shape bug in application code ships silently until read-time. `lib/submission-review.ts`'s
  `parseSectionReviews` does defensive runtime narrowing to compensate.

## Migrations

Standard Prisma workflow:

```bash
npx prisma migrate dev --name descriptive_name    # local dev — creates + applies + regenerates client
npx prisma migrate deploy                          # production — applies pending migrations only, no client regen, no schema-drift prompts
```

**Always use `migrate deploy` in production, never `migrate dev`** — `migrate dev`
can prompt to reset the database if it detects drift, which is never
acceptable against a database with real data.

11 migrations exist today (`prisma/migrations/`), reviewed chronologically as
part of this remediation:

- All are forward-compatible / additive except one `DROP TABLE website_content`
  — which dropped a table created two migrations earlier in the same
  development cycle (created and abandoned within ~24 hours, no data-loss risk
  in practice).
- One migration (`20260707123824_add_submission_year`) adds a `NOT NULL`
  column with no default — safe only because the table was empty at that
  point in development history; **this exact pattern (`NOT NULL ADD COLUMN`
  with no `DEFAULT`) would fail against a table with existing rows** and
  should never be repeated against a live database. Prefer the expand/contract
  pattern below instead.
- One migration (`20260723050000_baseline_user_prefill_columns`) is explicitly
  self-documented as a *baseline* reconciliation for columns that were applied
  via `prisma db push` outside normal migration history during early
  development — confirms the migration history isn't perfectly reproducible
  from scratch without this resolve step, but is handled correctly (marked
  `--applied`, not re-executed).

### Safe migration pattern (expand → deploy → migrate → switch → contract)

For any migration that changes a column's meaning or removes something the
currently-running application code still reads/writes:

1. **Expand**: add the new column/table alongside the old one (nullable, or
   with a default). Deploy this — old code still works, unaware of the new column.
2. **Migrate data**: backfill the new column from the old one, in a
   separate step (a script, not baked into the schema migration itself for
   anything beyond trivial row counts).
3. **Switch**: deploy application code that reads/writes the new column.
4. **Contract**: only once the new code has been running successfully, add a
   *following* migration that drops the old column.

Never combine steps 1 and 4 into one migration against a table with live data.

## Transactions & concurrency

The concurrency-sensitive paths (submission review/approval, registration
approval) use `prisma.$transaction` with `SELECT ... FOR UPDATE` row locks or
`Serializable` isolation — see `app/api/submissions/[id]/route.ts` and
`app/api/registrations/[id]/route.ts` for the two patterns in use. If you add
a new multi-step write that must be atomic (check-then-act, multi-table
update), follow one of those two existing patterns rather than inventing a
third.

## Backup

```bash
DATABASE_URL="mysql://user:pass@host:3306/db" BACKUP_DIR=/var/backups/sampath-pathikada RETENTION_DAYS=14 \
  ./scripts/backup-database.sh
```

- Uses `mysqldump --single-transaction` (consistent snapshot without locking
  writers — safe for this app's all-InnoDB schema), gzip-compressed, written
  as `<dbname>_<UTC-timestamp>.sql.gz`.
- Auto-prunes backups older than `RETENTION_DAYS` for that database name.
- **Verified compatible with both MySQL and MariaDB** — `mysqldump`'s
  `--set-gtid-purged` flag is MySQL-only and is added conditionally (checked
  via `mysqldump --help`) so the script doesn't fail against MariaDB.
- **Does not run inside the app's Docker container** — `node:20-alpine` has no
  MySQL client tools by design (keeping the runtime image minimal). Run this
  from wherever `mysqldump` can reach the database: the DB host itself, a
  dedicated backup host, or a cron job on the VPS.

### Automated backup — systemd timer (recommended for a systemd-based VPS)

`scripts/sampath-pathikada-backup.{service,timer}` and
`scripts/backup-failure-notify.sh` +
`scripts/sampath-pathikada-backup-failure-notify.service` are installable
systemd units, not just a documented cron line — a failed backup becomes a
`systemctl status` / `journalctl` failure entry, not a silently-skipped day.
**These units are not installed by anything in this repo automatically** —
CI/Docker never touch the host's systemd, by design (a backup mechanism a
deployment can accidentally uninstall by redeploying the app container is not
a reliable one). Install once, manually, on whichever host can reach MySQL
with `mysqldump`:

```bash
# 1. Put the app + scripts somewhere systemd can reference them (adjust the
#    unit files' WorkingDirectory/ExecStart paths if you use a different path
#    than /opt/sampath-pathikada-platform).
sudo mkdir -p /opt/sampath-pathikada-platform
sudo cp -r scripts /opt/sampath-pathikada-platform/

# 2. DATABASE_URL goes in a root-only-readable EnvironmentFile, never in the
#    unit file itself (unit files under /etc/systemd/system are typically
#    world-readable).
sudo mkdir -p /etc/sampath-pathikada
sudo tee /etc/sampath-pathikada/backup.env > /dev/null <<'EOF'
DATABASE_URL=mysql://user:pass@host:3306/sampath_pathikada
# Optional — see scripts/backup-failure-notify.sh for what this does.
# BACKUP_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...
EOF
sudo chmod 600 /etc/sampath-pathikada/backup.env

# 3. Install the units and enable the timer (NOT the .service directly —
#    enabling the .service would run it once at boot; the .timer is what
#    gives you the daily schedule).
sudo cp scripts/sampath-pathikada-backup.service \
        scripts/sampath-pathikada-backup.timer \
        scripts/sampath-pathikada-backup-failure-notify.service \
        /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now sampath-pathikada-backup.timer

# 4. Verify: don't assume the timer is correct just because `enable` succeeded.
systemctl list-timers sampath-pathikada-backup.timer   # confirm NEXT run time
sudo systemctl start sampath-pathikada-backup.service   # trigger one run now
journalctl -u sampath-pathikada-backup.service --since '5 min ago'  # confirm it actually wrote a .sql.gz
ls -la /var/backups/sampath-pathikada/                  # confirm the file exists
```

Default schedule is `02:00` server-local time with `Persistent=true` (a
missed run due to the host being off/rebooting fires on next boot instead of
silently skipping) — edit `OnCalendar=` in the `.timer` file before installing
if that's not a low-traffic window for you.

### Alternative: plain cron (if the host doesn't use systemd)

```cron
0 2 * * * DATABASE_URL="mysql://user:pass@host:3306/db" BACKUP_DIR=/var/backups/sampath-pathikada RETENTION_DAYS=30 /path/to/scripts/backup-database.sh >> /var/log/sampath-pathikada-backup.log 2>&1
```

This form has no equivalent to the `OnFailure=` failure notification above —
a failed `mysqldump` only shows up if you actually read
`/var/log/sampath-pathikada-backup.log`, or add `|| mail -s "backup failed" ...`
/ a webhook `curl` of your own to the crontab line. Prefer the systemd path
if the host supports it.

**Neither of the above is installed by this repository automatically** — this
section gives you working, tested artifacts (the units, the failure-notify
script); actually enabling one of them on your real host is a step only you
can perform, since it requires host access this remediation does not have.

## Restore

```bash
DATABASE_URL="mysql://user:pass@host:3306/target_db" ./scripts/restore-database.sh backups/db_20260101T020000Z.sql.gz
```

- **Destructive and interactive by design** — requires typing the exact
  target database name to confirm before it touches anything. Never wire this
  into an automated pipeline.
- After restoring: run `npx prisma migrate status` to confirm the restored
  schema matches what the currently-deployed application code expects (a
  backup taken before a migration will be behind if you've since deployed
  schema changes).

**This procedure has been tested end-to-end** (backup → restore → data
verified identical) against a local MariaDB instance as part of this
remediation — not just written and assumed to work. It has **not** been
tested against your actual production MySQL instance, data volume, or network
conditions — that's a real restore drill you should run before you need it
for real (see the Disaster Recovery section of
[OPERATIONS.md](./OPERATIONS.md)).

## NOT VERIFIED

- Live MySQL version, actual index-usage statistics (`EXPLAIN` on real query
  plans), and connection-pool behavior under real concurrent load — no access
  to a live production-scale database in this session.
- Whether your MySQL hosting provider has its own independent backup
  mechanism — the scripts above are this repo's own backup story and should
  be treated as the baseline, not assumed redundant with something external
  until you've confirmed it.
