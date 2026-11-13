// Runs the CloudFront function code from infra/edge.ts against sample
// requests. Usage: node scripts/check-edge.cjs <bundled infra/edge.cjs>
"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");

const edge = require(path.resolve(process.argv[2]));

function compile(body, returns) {
  // Same shape as the handler SST generates around the injection.
  return new Function(
    "event",
    `return (async function handler(event) {\n${body}\nreturn ${returns};\n})(event);`,
  );
}

async function main() {
  const redirects = edge.loadRedirects();
  const request = compile(edge.viewerRequestInjection(redirects), "event.request");

  const passThrough = await request({ request: { uri: "/storitve" } });
  assert.equal(passThrough.uri, "/storitve", "a new URL must not redirect");

  for (const { from, to, status } of redirects) {
    const uri = from.replace(/:[a-z]+/gi, "Primer-Zapisa");
    const expected = to.replace(/:[a-z]+/gi, "primer-zapisa");
    for (const variant of [uri, `${uri}/`]) {
      const result = await request({ request: { uri: variant } });
      assert.equal(result.statusCode, status, `${variant} status`);
      assert.equal(result.headers.location.value, expected, `${variant} location`);
    }
  }

  for (const noindex of [true, false]) {
    const response = compile(edge.viewerResponseInjection({ noindex }), "event.response");
    const result = await response({ response: { headers: {} } });
    assert.equal(result.headers["x-content-type-options"].value, "nosniff");
    assert.equal(Boolean(result.headers["x-robots-tag"]), noindex, "x-robots-tag");
  }

  console.log(`Edge check passed (${redirects.length} redirects)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
