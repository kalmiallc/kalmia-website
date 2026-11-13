/// <reference path="./.sst/platform/config.d.ts" />

/**
 * One stack per stage, always in eu-central-1.
 *
 * SST creates one static site: an S3 bucket and a CloudFront distribution
 * with Astro's `dist/`. There is no Lambda, database, or API. Settings come
 * from the process environment (GitHub Environment on CI).
 */
export default $config({
  app(input) {
    return {
      name: "kalmia-website",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage ?? ""),
      home: "aws",
      providers: {
        aws: {
          region: "eu-central-1",
        },
      },
    };
  },
  async run() {
    const {
      loadRedirects,
      viewerRequestInjection,
      viewerResponseInjection,
    } = await import("./infra/edge");

    const isProduction = $app.stage === "production";
    const domain = process.env.SITE_DOMAIN?.trim() || "";
    const domainRedirects = (process.env.SITE_DOMAIN_REDIRECTS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const site = new sst.aws.StaticSite("Web", {
      path: ".",
      build: {
        command: "npm run build",
        output: "dist",
      },
      errorPage: "404.html",
      assets: {
        fileOptions: [
          // Unhashed files (images, sitemap.xml, robots.txt, llms.txt).
          { files: "**", cacheControl: "public,max-age=3600" },
          {
            files: "**/*.html",
            cacheControl: "max-age=0,no-cache,no-store,must-revalidate",
          },
          // Astro output with content hashes in the file name.
          {
            files: "_astro/**",
            cacheControl: "max-age=31536000,public,immutable",
          },
        ],
      },
      edge: {
        viewerRequest: {
          injection: viewerRequestInjection(loadRedirects()),
        },
        viewerResponse: {
          injection: viewerResponseInjection({ noindex: !isProduction }),
        },
      },
      ...(domain
        ? {
            domain: {
              name: domain,
              ...(domainRedirects.length ? { redirects: domainRedirects } : {}),
            },
          }
        : {}),
    });

    return {
      url: site.url,
    };
  },
});
