#!/usr/bin/env bash
# Dumps the MySQL database to a timestamped, gzip-compressed .sql.gz file and
# prunes backups older than the configured retention period.
#
# This is NOT run inside the app's Docker container — the app image
# (node:20-alpine) has no MySQL client tools, and this script has no Node/Prisma
# dependency by design (a backup mechanism that depends on the application
# working is not a real backup mechanism). Run this from wherever mysqldump can
# reach the database: the DB host itself, a dedicated backup host, or a cron
# job on the VPS running the stack. See DATABASE.md for the recommended cron
# entry and full restore procedure.
#
# Usage:
#   DATABASE_URL="mysql://user:pass@host:3306/dbname" ./scripts/backup-database.sh
#   BACKUP_DIR=/var/backups/sampath-pathikada RETENTION_DAYS=14 ./scripts/backup-database.sh
#
# Required: DATABASE_URL (same format/value as the application's .env)
# Optional: BACKUP_DIR (default: ./backups), RETENTION_DAYS (default: 14)

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Export it (same value as the app's .env) before running this script." >&2
  exit 1
fi

if ! command -v mysqldump >/dev/null 2>&1; then
  echo "ERROR: mysqldump is not installed or not on PATH. Install the MySQL/MariaDB client tools." >&2
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

# Parse mysql://user:password@host:port/database out of DATABASE_URL without
# a Node/Prisma dependency — this script must work even if the app is down.
# Split on the LAST '@' (the user:pass/host separator) — the password itself
# may legitimately contain '@', which would break a first-'@' split.
URL_NO_SCHEME="${DATABASE_URL#mysql://}"
HOSTPORTDB="${URL_NO_SCHEME##*@}"
USERPASS="${URL_NO_SCHEME%@*}"
# USERPASS may be just "user" (no password, e.g. local dev's root@localhost) —
# %%:*/#*: both return the input unchanged when there's no ':', which would
# otherwise leak the username into DB_PASS.
if [[ "$USERPASS" == *:* ]]; then
  DB_USER="${USERPASS%%:*}"
  DB_PASS="${USERPASS#*:}"
else
  DB_USER="$USERPASS"
  DB_PASS=""
fi
HOSTPORT="${HOSTPORTDB%%/*}"
DB_NAME="${HOSTPORTDB#*/}"
DB_NAME="${DB_NAME%%\?*}"  # strip any ?connection_limit=... query string
DB_HOST="${HOSTPORT%%:*}"
DB_PORT="${HOSTPORT#*:}"
if [ "$DB_PORT" = "$HOSTPORT" ]; then DB_PORT="3306"; fi

if [ -z "$DB_NAME" ] || [ -z "$DB_HOST" ]; then
  echo "ERROR: Could not parse DATABASE_URL. Expected format: mysql://user:password@host:port/database" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"
TMP_FILE="${OUT_FILE}.tmp"

echo "Backing up '$DB_NAME' from $DB_HOST:$DB_PORT to $OUT_FILE ..."

# --single-transaction: consistent snapshot for InnoDB tables without locking
# writers for the duration of the dump (safe for this app — every table here
# is InnoDB via Prisma's default). --routines/--triggers: this schema has
# neither today, but included so a future addition isn't silently excluded.
# --set-gtid-purged is MySQL-only (not recognized by MariaDB's mysqldump) —
# added conditionally so this script works against either.
DUMP_ARGS=(--host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --single-transaction --routines --triggers)
if mysqldump --help 2>&1 | grep -q -- "--set-gtid-purged"; then
  DUMP_ARGS+=(--set-gtid-purged=OFF)
fi

MYSQL_PWD="$DB_PASS" mysqldump "${DUMP_ARGS[@]}" "$DB_NAME" | gzip > "$TMP_FILE"

mv "$TMP_FILE" "$OUT_FILE"
echo "Backup complete: $OUT_FILE ($(du -h "$OUT_FILE" | cut -f1))"

# Prune backups older than RETENTION_DAYS for this database name only, so this
# script is safe to point at a directory shared with other databases' backups.
find "$BACKUP_DIR" -maxdepth 1 -name "${DB_NAME}_*.sql.gz" -mtime "+${RETENTION_DAYS}" -print -delete

echo "Retention: keeping backups from the last ${RETENTION_DAYS} day(s) in $BACKUP_DIR"
