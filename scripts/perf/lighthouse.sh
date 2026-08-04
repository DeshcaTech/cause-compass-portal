#!/usr/bin/env bash
# Lighthouse mobile performance audit (simulated slow 4G + 4x CPU throttling).
# Usage: bash scripts/perf/lighthouse.sh [url]
set -euo pipefail
URL="${1:-http://localhost:8080/}"
OUT_DIR="$(dirname "$0")/reports"
mkdir -p "$OUT_DIR"
CHROME_BIN="$(ls -d "${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}"/chromium*/chrome-linux/chrome 2>/dev/null | head -n1)"
export CHROME_PATH="${CHROME_PATH:-$CHROME_BIN}"
bunx --bun lighthouse@12 "$URL" \
  --preset=desktop=false \
  --form-factor=mobile \
  --throttling-method=simulate \
  --only-categories=performance \
  --output=json --output=html \
  --output-path="$OUT_DIR/home" \
  --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage"
