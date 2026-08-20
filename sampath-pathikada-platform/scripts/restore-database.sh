#!/usr/bin/env bash
# Restores a MySQL database from a .sql.gz backup produced by backup-database.sh.
#
# DESTRUCTIVE: this overwrites the target database. It intentionally does NOT
# run non-interactively without confirmation — see the prompt below. Never
# wire this into an automated/cron pipeline; restores must be a deliberate,
# reviewed action (see DATABASE.md's incident-response section for when this
# is actually the right move vs. investigating further first).
#
# Usage:
#   DATABASE_URL="mysql://user:pass@host:3306/dbname" ./scripts/restore-database.sh backups/sampath_pathikada_20260101T000000Z.sql.gz

set -euo pipefail

BACKUP_FILE="${1:-}"
if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <path-to-backup.sql.gz>" >&2
  exit 1
fi
if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: backup file not found: $BACKUP_FILE" >&2
  exit 1
fi
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Export it (the TARGET database to restore into) before running this script." >&2
  exit 1
fi
if ! command -v mysql >/dev/null 2>&1; then
  echo "ERROR: mysql client is not installed or not on PATH." >&2
  exit 1
fi

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
DB_NAME="${DB_NAME%%\?*}"
DB_HOST="${HOSTPORT%%:*}"
DB_PORT="${HOSTPORT#*:}"
if [ "$DB_PORT" = "$HOSTPORT" ]; then DB_PORT="3306"; fi

echo "═══════════════════════════════════════════════════════════════════"
echo "  RESTORE WILL OVERWRITE THE FOLLOWING DATABASE:"
echo "    Host:     $DB_HOST:$DB_PORT"
echo "    Database: $DB_NAME"
echo "    From:     $BACKUP_FILE"
echo "═══════════════════════════════════════════════════════════════════"
echo "This will DROP existing tables and replace their contents. This cannot be undone"
echo "unless you have a separate backup of the CURRENT state."
echo
read -r -p "Type the database name ($DB_NAME) to confirm, or anything else to abort: " CONFIRM
if [ "$CONFIRM" != "$DB_NAME" ]; then
  echo "Aborted — confirmation did not match."
  exit 1
fi

echo "Restoring..."
gunzip -c "$BACKUP_FILE" | MYSQL_PWD="$DB_PASS" mysql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  "$DB_NAME"

echo "Restore complete. Recommended next steps:"
echo "  1. Run 'npm run db:generate' and confirm the app's Prisma schema still matches (npx prisma migrate status)."
echo "  2. Spot-check row counts against what you expected from the backup's timestamp."
echo "  3. If this restore followed an incident, document RPO actually achieved (backup age vs. data lost) in your incident record."
