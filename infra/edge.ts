/**
 * Code injected into the CloudFront functions of the static site.
 *
 * CloudFront functions (runtime cloudfront-js-2.0) have a 10 KB code limit,
 * so the injected code is plain ES5 with the redirect table inlined.
 */
import { existsSync, readFileSync } from "node:fs";

export interface Redirect {
  /** Old path, e.g. `/sl/case/weiler` or `/sl/blog/:slug`. */
  from: string;
  /** New path, e.g. `/reference/weiler-abrasives` or `/blog/:slug`. */
  to: string;
  status: 301 | 302;
}

const REDIRECTS_FILE = "content/redirects.json";
const MAX_INJECTION_BYTES = 8 * 1024;

/** Reads `content/redirects.json`. A missing file means no redirects. */
export function loadRedirects(file = REDIRECTS_FILE): Redirect[] {
  if (!existsSync(file)) {
    return [];
  }
  const data: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(data)) {
    throw new Error(`${file}: expected an array of { from, to, status }`);
  }
  return data.map((item, index) => {
    const { from, to, status } = (item ?? {}) as Partial<Redirect>;
    if (typeof from !== "string" || !from.startsWith("/")) {
      throw new Error(`${file}[${index}]: "from" must start with /`);
    }
    if (typeof to !== "string" || !to.startsWith("/")) {
      throw new Error(`${file}[${index}]: "to" must start with /`);
    }
    if (status !== 301 && status !== 302) {
      throw new Error(`${file}[${index}]: "status" must be 301 or 302`);
    }
    for (const param of to.match(/:[a-z]+/gi) ?? []) {
      if (!from.includes(param)) {
        throw new Error(`${file}[${index}]: ${param} is not in "from"`);
      }
    }
    return { from, to, status };
  });
}

function normalizePath(path: string): string {
  const lower = path.toLowerCase();
  return lower.length > 1 && lower.endsWith("/") ? lower.slice(0, -1) : lower;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Viewer request: answers old URLs with a redirect before the site router.
 * Matching ignores case and a trailing slash. `:name` matches one path
 * segment and is lowercased in the target (old blog slugs had capitals).
 */
export function viewerRequestInjection(redirects: Redirect[]): string {
  if (redirects.length === 0) {
    return "";
  }

  const exact: Record<string, [string, number]> = {};
  const patterns: [string, string, number][] = [];

  for (const { from, to, status } of redirects) {
    const source = normalizePath(from);
    if (!source.includes(":")) {
      exact[source] = [to, status];
      continue;
    }
    const names: string[] = [];
    const regex = source
      .split("/")
      .map((segment) => {
        if (segment.startsWith(":")) {
          names.push(segment.slice(1));
          return "([^/]+)";
        }
        return escapeRegExp(segment);
      })
      .join("/");
    const target = to.replace(/:([a-z]+)/gi, (_, name: string) => {
      return "$" + (names.indexOf(name.toLowerCase()) + 1);
    });
    patterns.push([`^${regex}$`, target, status]);
  }

  const code = `
  var kalmiaRedirect = (function (uri) {
    var R = ${JSON.stringify(exact)};
    var P = ${JSON.stringify(patterns)};
    var u = uri.toLowerCase();
    if (u.length > 1 && u.charAt(u.length - 1) === "/") u = u.slice(0, -1);
    var hit = R[u];
    if (!hit) {
      for (var i = 0; i < P.length; i++) {
        var m = u.match(new RegExp(P[i][0]));
        if (m) {
          hit = [P[i][1].replace(/\\$(\\d)/g, function (_, n) { return m[n]; }), P[i][2]];
          break;
        }
      }
    }
    if (!hit) return null;
    return {
      statusCode: hit[1],
      statusDescription: hit[1] === 301 ? "Moved Permanently" : "Found",
      headers: { location: { value: hit[0] } }
    };
  })(event.request.uri);
  if (kalmiaRedirect) return kalmiaRedirect;
`;

  const bytes = Buffer.byteLength(code, "utf8");
  if (bytes > MAX_INJECTION_BYTES) {
    throw new Error(
      `Redirect code is ${bytes} bytes. CloudFront functions allow 10 KB in total. Use :slug patterns in ${REDIRECTS_FILE}.`,
    );
  }
  return code;
}

/**
 * Viewer response: security headers on every response. Stages other than
 * production also get `X-Robots-Tag: noindex` so search engines skip them.
 * The Content-Security-Policy is added together with analytics (phase 6).
 */
export function viewerResponseInjection(options: { noindex: boolean }): string {
  const headers: Record<string, string> = {
    "strict-transport-security": "max-age=31536000",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
  };
  if (options.noindex) {
    headers["x-robots-tag"] = "noindex, nofollow";
  }
  return Object.entries(headers)
    .map(
      ([name, value]) =>
        `event.response.headers[${JSON.stringify(name)}] = { value: ${JSON.stringify(value)} };`,
    )
    .join("\n  ");
}
