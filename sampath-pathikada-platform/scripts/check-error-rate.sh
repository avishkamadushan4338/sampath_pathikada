#!/usr/bin/env bash
# Counts "level":"error" lines the app logged (via lib/logger.ts's structured
# JSON output) in the last WINDOW_MINUTES and alerts if that exceeds
# THRESHOLD. This is deliberately NOT an APM/metrics service — no Sentry, no
# Prometheus, no new runtime dependency — just a periodic grep over the same
# journald/docker logs an operator would already read manually (see
# OPERATIONS.md's Log Inspection section), turned into a scheduled check so a
# 3am error spike doesn't wait for a human to think to look.
#
# Reuses the BACKUP_ALERT_WEBHOOK_URL pattern from backup-failure-notify.sh
# on purpose — one webhook to configure, not two different notification
# systems for two different checks.
#
# Requires: journalctl (reads the app's docker/systemd-managed log output).
# If you're not running under systemd-managed Docker logging, adjust the
# LOG_SOURCE command below to whatever reads your actual log destination
# (e.g. `docker compose logs --since ...`).
#
# Usage (see install steps in OPERATIONS.md):
#   THRESHOLD=10 WINDOW_MINUTES=5 ./scripts/check-error-rate.sh

set -euo pipefail

WINDOW_MINUTES="${WINDOW_MINUTES:-5}"
THRESHOLD="${THRESHOLD:-10}"
CONTAINER_NAME="${CONTAINER_NAME:-sampath-pathikada-platform}"

LOG_SOURCE() {
  docker logs --since "${WINDOW_MINUTES}m" "$CONTAINER_NAME" 2>&1
}

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker not found on PATH — adjust LOG_SOURCE() in this script for your actual log destination." >&2
  exit 1
fi

ERROR_COUNT=$(LOG_SOURCE | grep -c '"level":"error"' || true)

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) sampath-pathikada error-rate check: ${ERROR_COUNT} error-level log lines in the last ${WINDOW_MINUTES}m (threshold ${THRESHOLD})"

if [ "$ERROR_COUNT" -gt "$THRESHOLD" ]; then
  MSG="Sampath Pathikada: ${ERROR_COUNT} error-level log lines in the last ${WINDOW_MINUTES}m (threshold ${THRESHOLD}) — check: docker logs --since ${WINDOW_MINUTES}m ${CONTAINER_NAME} | grep error"
  echo "$MSG" | systemd-cat -t sampath-pathikada-error-rate -p err 2>/dev/null || echo "$MSG" >&2

  if [ -n "${BACKUP_ALERT_WEBHOOK_URL:-}" ]; then
    curl -fsS -m 10 -X POST -H "Content-Type: application/json" \
      -d "{\"text\": \"$MSG\"}" \
      "$BACKUP_ALERT_WEBHOOK_URL" || echo "check-error-rate: webhook POST failed (non-fatal)" >&2
  fi
  exit 1
fi

exit 0
