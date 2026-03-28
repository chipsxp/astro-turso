# Astro Security Configuration Reference

> Source: https://docs.astro.build/en/reference/configuration-reference/  
> Captured: 2026-03-28 for astro-blog project (Astro 5.x)

---

## `security`

**Type:** `Record<"checkOrigin", boolean> | undefined`  
**Default:** `{checkOrigin: true}`  
**Added in:** `astro@4.9.0`

Enables security measures for an Astro website.

These features only exist for pages rendered on demand (SSR) using `server` mode or pages that opt out of prerendering in `static` mode.

```js
export default defineConfig({
  output: "server",
  security: {
    checkOrigin: false,
  },
});
```

---

### `security.checkOrigin`

**Type:** `boolean`  
**Default:** `true`  
**Added in:** `astro@4.9.0`

Performs a check that the `"origin"` header, automatically passed by all modern browsers, matches the URL sent by each `Request`. This is used to provide Cross-Site Request Forgery (CSRF) protection.

The "origin" check is executed only for pages rendered on demand, and **only for the requests `POST`, `PATCH`, `DELETE` and `PUT` with one of the following `content-type` headers**:

- `'application/x-www-form-urlencoded'`
- `'multipart/form-data'`
- `'text/plain'`

If the `"origin"` header doesn't match the `pathname` of the request, Astro will return a **403 status code** and will not render the page.

**Error message returned:** `"Cross-site DELETE form submissions are forbidden"`

---

### `security.allowedDomains`

**Type:** `Array<RemotePattern>`  
**Default:** `[]`  
**Added in:** `astro@5.14.2`

Defines a list of permitted host patterns for incoming requests when using SSR. When configured, Astro will validate the `X-Forwarded-Host` header against these patterns for security. If the header doesn't match any allowed pattern, the header is ignored and the request's original host is used instead.

This prevents host header injection attacks where malicious actors can manipulate the `Astro.url` value by sending crafted `X-Forwarded-Host` headers.

**Pattern wildcards:**

- `*.example.com` — matches exactly one subdomain level
- `**.example.com` — matches any subdomain depth

```js
{
  security: {
    allowedDomains: [
      { hostname: "**.example.com", protocol: "https" },
      { hostname: "staging.myapp.com", protocol: "https", port: "443" },
    ];
  }
}
```

To allow all domains (e.g., behind trusted reverse proxies with dynamic domains):

```js
{
  security: {
    allowedDomains: [{}]; // Use only when necessary
  }
}
```

> When not configured, `X-Forwarded-Host` headers are **not trusted** and will be ignored.

---

### `security.actionBodySizeLimit`

**Type:** `number`  
**Default:** `1048576` (1 MB)  
**Added in:** `astro@5.18.0`

Sets the maximum size in bytes allowed for action request bodies.

---

### `security.csp`

**Type:** `boolean | object`  
**Default:** `false`  
**Added in:** `astro@6.0.0`

Enables Content Security Policy (CSP) support. Adds `<meta http-equiv="content-security-policy">` to each page.

**Limitations:**

- External scripts and styles are not supported out of the box
- Astro view transitions (`<ClientRouter />`) are not supported
- Shiki syntax highlighting uses inline styles (incompatible)
- `unsafe-inline` directives are incompatible

**Sub-options:** `algorithm`, `directives`, `styleDirective`, `scriptDirective`

---

## `site`

**Type:** `string`

Your final, deployed URL. Astro uses this full URL to generate your sitemap and canonical URLs in your final build.

```js
{
  site: "https://www.my-site.dev";
}
```

---

## `@astrojs/node` Adapter Options (v9.x)

Source: https://docs.astro.build/en/guides/integrations-guide/node/

### `mode`

**Type:** `'middleware' | 'standalone'`

- `standalone` — builds a self-starting server (`node ./dist/server/entry.mjs`)
- `middleware` — builds output usable as middleware for Express/Fastify

### `experimentalDisableStreaming`

**Type:** `boolean`  
**Default:** `false`  
**Added in:** `@astrojs/node@9.3.0`

Disables HTML streaming for on-demand rendered pages.

### Custom host/port (standalone mode)

Override via environment variables at runtime:

```bash
HOST=0.0.0.0 PORT=4321 node ./dist/server/entry.mjs
```

### HTTPS (standalone mode)

```bash
SERVER_KEY_PATH=./private/key.pem SERVER_CERT_PATH=./private/cert.pem node ./dist/server/entry.mjs
```

> **Note (v9.x):** There is no `trustProxy` option in `@astrojs/node` v9. When deployed behind a TLS-terminating reverse proxy (Railway, Nginx, Cloudflare), the Node.js process receives plain HTTP internally. This causes `security.checkOrigin` to false-positive because the internal request URL uses `http://` while the browser sends `Origin: https://`. Fix: set `security: { checkOrigin: false }` and ensure `SameSite=Strict` cookies provide equivalent CSRF protection.

---

## Known Issue: Railway + checkOrigin False Positive

**Symptom:** `403 Cross-site DELETE form submissions are forbidden` for same-origin DELETE requests  
**Cause:** Railway terminates TLS at the Fastly CDN edge → Node.js receives `http://` scheme → origin mismatch  
**Fix:** `security: { checkOrigin: false }` in `astro.config.mjs`  
**Safe because:** `SameSite=Strict` JWT auth cookie blocks cross-site credential submission

See `docs/project_notes/bugs.md` for the full entry (2026-03-28).
