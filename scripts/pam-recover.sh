#!/bin/bash
# Pam Recovery Script — stop gateway, clear caches, restart
set -e

echo "=== Pam Recovery $(date) ==="

echo "→ Stopping gateway..."
systemctl --user stop openclaw-gateway 2>/dev/null || true
sleep 2

echo "→ Clearing caches..."
rm -rf /tmp/openclaw 2>/dev/null || true
rm -rf /tmp/openclaw-web-fetch-* 2>/dev/null || true

echo "→ Starting gateway..."
systemctl --user start openclaw-gateway
sleep 5

STATUS=$(systemctl --user is-active openclaw-gateway 2>/dev/null)
echo "→ Gateway: $STATUS"

if [ "$STATUS" = "active" ]; then
    echo "✅ Recovery complete. Pam should be back."
else
    echo "❌ Gateway failed to start. Check: journalctl --user -u openclaw-gateway -n 20"
    exit 1
fi
