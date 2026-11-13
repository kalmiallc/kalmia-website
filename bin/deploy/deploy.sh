#!/usr/bin/env bash
# Build the Astro site and run sst deploy for one stage.
# SST runs `npm run build` itself (see sst.config.ts).
set -euo pipefail

STAGE="${1:?usage: bin/deploy/deploy.sh <dev|staging|production>}"
case "$STAGE" in
  dev|staging|production) ;;
  *)
    echo "Unknown stage: $STAGE" >&2
    exit 1
    ;;
esac

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "Stage ${STAGE} (eu-central-1): sst deploy."
npx sst deploy --stage "$STAGE"
