#!/usr/bin/env bash
# Runs when sampath-pathikada-backup.service fails (see OnFailure= in
# sampath-pathikada-backup.service). By default this only guarantees the
# failure is loud in `journalctl` / `systemctl status` — a human checking
# logs will see it, closing the "silent backup failure" gap. It does NOT
# page anyone by default: wiring a real notification channel (email, Slack
# webhook, PagerDuty, etc.) is an infrastructure/vendor decision left to you,
# same principle as the rest of this repo's observability approach (see
# OPERATIONS.md's "Do not overengineer" section) — fill in BACKUP_ALERT_WEBHOOK_URL
# below if/when you pick one.
#
# Install: see the "Automated backup (systemd)" section in DATABASE.md.

set -euo pipefail

MSG="Sampath Pathikada database backup FAILED at $(date -u +%Y-%m-%dT%H:%M:%SZ) — check: journalctl -u sampath-pathikada-backup.service --since '1 hour ago'"

echo "$MSG" | systemd-cat -t sampath-pathikada-backup -p err

# Optional: set BACKUP_ALERT_WEBHOOK_URL (e.g. a Slack incoming webhook) in
# /etc/sampath-pathikada/backup.env to also get a push notification. Left
# unset by default — no external service dependency is added unless you
# explicitly opt in.
if [ -n "${BACKUP_ALERT_WEBHOOK_URL:-}" ]; then
  # $MSG is entirely built by this script (timestamp + fixed text) — no
  # externally-controlled input reaches this payload, so a plain printf is
  # safe here without pulling in jq/node just to escape a fixed string.
  curl -fsS -m 10 -X POST -H "Content-Type: application/json" \
    -d "{\"text\": \"$MSG\"}" \
    "$BACKUP_ALERT_WEBHOOK_URL" || echo "backup-failure-notify: webhook POST failed (non-fatal)" | systemd-cat -t sampath-pathikada-backup -p warning
fi
