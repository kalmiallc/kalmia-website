#!/usr/bin/env bash
# Syntax-check the SST config and the edge code.
# SST's generated platform sources do not typecheck under the site's
# TypeScript, so the config is bundled with esbuild instead.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export SST_TELEMETRY_DISABLED=1
npx sst install --stage dev

ESBUILD="$ROOT/.sst/platform/node_modules/esbuild/bin/esbuild"
"$ESBUILD" sst.config.ts \
  --bundle \
  --platform=node \
  --format=cjs \
  --outfile=/tmp/kalmia-website-sst-config.js \
  --external:@pulumi/* \
  --external:@aws-sdk/* \
  --log-level=warning

# Bundle the edge helpers and check that the generated CloudFront code
# parses and that content/redirects.json (when present) is valid.
"$ESBUILD" infra/edge.ts \
  --bundle \
  --platform=node \
  --format=cjs \
  --outfile=/tmp/kalmia-website-edge.cjs \
  --log-level=warning
node scripts/check-edge.cjs /tmp/kalmia-website-edge.cjs

echo "Infra check passed"
