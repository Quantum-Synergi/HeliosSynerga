#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${RAILWAY_PUBLIC_URL:-}}"
if [[ -z "$BASE_URL" ]]; then
	echo "❌ Missing Railway URL"
	echo "Usage: bash scripts/railway-judge-check.sh https://your-railway-public-url"
	exit 1
fi

BASE_URL="${BASE_URL%/}"

declare -a PATHS=(
	"/"
	"/api/health"
	"/api/status"
	"/api/trades"
	"/api/wallet-stats"
	"/api/pnl-series"
	"/api/trading-settings"
)

echo "🔎 Railway judge verification"
echo "- Target: $BASE_URL"

failed=0
for p in "${PATHS[@]}"; do
	url="$BASE_URL$p"
	code="$(curl -sS -o /tmp/railway_check_body.txt -w "%{http_code}" "$url" || true)"
	bytes="$(wc -c < /tmp/railway_check_body.txt)"

	if [[ "$code" == "200" ]]; then
		echo "✅ $p => $code (${bytes} bytes)"
	else
		echo "❌ $p => $code (${bytes} bytes)"
		failed=1
	fi
done

if [[ "$failed" -ne 0 ]]; then
	echo "❌ Railway judge verification failed"
	exit 1
fi

echo "✅ Railway judge verification passed"
