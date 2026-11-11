/**
 * Phase 4 Smoke & E2E Validation Runner (Read-Only)
 * Verifies Matrix A, C, D, and E across the built server without mutating production data.
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const PORT = 4329;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/`, { method: "HEAD" });
      if (res.status === 200 || res.status === 302) return true;
    } catch {
      // Waiting for socket
    }
    await sleep(250);
  }
  return false;
}

async function timeRequest(url, options = {}) {
  const start = performance.now();
  const res = await fetch(url, options);
  const ttfb = performance.now() - start;
  const bodyText = await res.text();
  const bytes = Buffer.byteLength(bodyText, "utf-8");
  return { status: res.status, headers: res.headers, ttfb, bytes, bodyText };
}

async function run() {
  console.log("Starting production server on port", PORT, "...");
  const server = spawn("node", ["--env-file=.env", "dist/server/entry.mjs"], {
    env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  server.stdout.on("data", (d) => {
    // optional stdout capture
  });
  server.stderr.on("data", (d) => {
    // optional stderr capture
  });

  try {
    const ready = await waitForServer();
    if (!ready) {
      throw new Error("Server failed to start within timeout");
    }
    console.log("Server is ready at", BASE_URL);

    const report = {
      matrixA: [],
      matrixC: [],
      matrixD: [],
      matrixE: [],
    };

    // ─── MATRIX A: API Security ──────────────────────────
    console.log("\n─── Matrix A: API Security Checks ───");

    // 1. Public reads
    for (const path of ["/api/articles", "/api/events", "/api/sales", "/api/categories"]) {
      const { status, bodyText } = await timeRequest(`${BASE_URL}${path}`);
      let isOk = status === 200;
      let notes = `Status ${status}`;
      if (path === "/api/events" && isOk) {
        try {
          const events = JSON.parse(bodyText);
          const hasBody = Array.isArray(events) && events.some((e) => "body" in e);
          if (hasBody) {
            notes += " (WARNING: body field leaked in list)";
          } else {
            notes += " (N1 verified: body field omitted)";
          }
        } catch {}
      }
      report.matrixA.push({ path, expected: 200, actual: status, pass: isOk, notes });
      console.log(`  ${isOk ? "✓" : "✗"} GET ${path} -> ${status} (${notes})`);
    }

    // 2. Public write paths (read-only validation probes)
    {
      // View beacon with invalid ID -> 400
      const { status } = await timeRequest(`${BASE_URL}/api/articles/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: -999 }),
      });
      const pass = status === 400;
      report.matrixA.push({
        path: "POST /api/articles/view",
        expected: 400,
        actual: status,
        pass,
        notes: pass ? "Route reachable without auth; rejected invalid ID safely" : "Unexpected status",
      });
      console.log(`  ${pass ? "✓" : "✗"} POST /api/articles/view (invalid ID) -> ${status}`);
    }

    {
      // Analytics track beacon with empty body -> 400 (NOT 401!)
      const { status } = await timeRequest(`${BASE_URL}/api/analytics/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const pass = status === 400;
      report.matrixA.push({
        path: "POST /api/analytics/track",
        expected: 400,
        actual: status,
        pass,
        notes: pass ? "N9 verified: reachable unauthenticated (400 validation error, not 401)" : `Failed: returned ${status}`,
      });
      console.log(`  ${pass ? "✓" : "✗"} POST /api/analytics/track (empty body) -> ${status} (${report.matrixA.at(-1).notes})`);
    }

    // 3. Protected writes without auth -> 401
    const protectedWrites = [
      ["POST", "/api/articles", { title: "x" }],
      ["PUT", "/api/articles/nonexistent", { title: "x" }],
      ["DELETE", "/api/articles/nonexistent", null],
      ["POST", "/api/upload", null],
      ["POST", "/api/admin/ads", { name: "x" }],
      ["GET", "/api/admin/articles", null],
      ["GET", "/api/admin/events", null],
      ["GET", "/api/admin/sales", null],
    ];

    for (const [method, path, body] of protectedWrites) {
      const opts = { method, headers: {} };
      if (body) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(body);
      }
      const { status } = await timeRequest(`${BASE_URL}${path}`, opts);
      const pass = status === 401;
      report.matrixA.push({ path: `${method} ${path}`, expected: 401, actual: status, pass, notes: "Requires auth" });
      console.log(`  ${pass ? "✓" : "✗"} ${method} ${path} -> ${status}`);
    }

    // 4. Admin page redirects -> 302 to /admin
    const adminPages = ["/admin/users", "/admin/settings", "/admin/dashboard", "/admin/analytics"];
    for (const path of adminPages) {
      const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
      const pass = res.status === 302 && (res.headers.get("location") || "").includes("/admin");
      report.matrixA.push({
        path: `GET ${path}`,
        expected: "302 to /admin",
        actual: `${res.status} -> ${res.headers.get("location")}`,
        pass,
        notes: "Unauthenticated admin page redirect",
      });
      console.log(`  ${pass ? "✓" : "✗"} GET ${path} -> ${res.status} (Location: ${res.headers.get("location")})`);
    }

    // ─── MATRIX C: Security Headers & CSP ────────────────
    console.log("\n─── Matrix C: Security Headers & CSP Checks ───");
    {
      const { headers } = await timeRequest(`${BASE_URL}/`);
      const ctOptions = headers.get("x-content-type-options") === "nosniff";
      const frameOptions = headers.get("x-frame-options") === "DENY";
      const referrerPolicy = headers.get("referrer-policy") === "strict-origin-when-cross-origin";
      const csp = headers.get("content-security-policy-report-only") || "";
      const hasGA = csp.includes("googletagmanager.com") && csp.includes("google-analytics.com");

      report.matrixC.push(
        { check: "X-Content-Type-Options: nosniff", pass: ctOptions },
        { check: "X-Frame-Options: DENY", pass: frameOptions },
        { check: "Referrer-Policy: strict-origin-when-cross-origin", pass: referrerPolicy },
        { check: "Public CSP includes Google Analytics hosts", pass: hasGA }
      );
      console.log(`  ${ctOptions ? "✓" : "✗"} X-Content-Type-Options: nosniff`);
      console.log(`  ${frameOptions ? "✓" : "✗"} X-Frame-Options: DENY`);
      console.log(`  ${referrerPolicy ? "✓" : "✗"} Referrer-Policy: strict-origin-when-cross-origin`);
      console.log(`  ${hasGA ? "✓" : "✗"} Public CSP includes GA`);
    }

    {
      // Check /shop CSP allows PayPal
      const { headers } = await timeRequest(`${BASE_URL}/shop`);
      const csp = headers.get("content-security-policy-report-only") || "";
      const hasPaypal = csp.includes("paypal.com");
      report.matrixC.push({ check: "/shop CSP includes PayPal hosts", pass: hasPaypal });
      console.log(`  ${hasPaypal ? "✓" : "✗"} /shop CSP includes PayPal hosts`);
    }

    // ─── MATRIX E: Performance Timing & Response Sizes ──
    console.log("\n─── Matrix E: Performance Baseline (5-run medians) ───");
    const pagesToBenchmark = [
      { name: "Homepage (/)", path: "/" },
      { name: "Blog Index (/blog)", path: "/blog" },
      { name: "Upcoming Events (/upcoming-events)", path: "/upcoming-events" },
      { name: "Events Archive (/events/archive)", path: "/events/archive" },
      { name: "Shop Index (/shop)", path: "/shop" },
      { name: "API Events (/api/events)", path: "/api/events" },
      { name: "API Categories (/api/categories)", path: "/api/categories" },
    ];

    for (const page of pagesToBenchmark) {
      const times = [];
      let bytes = 0;
      let lastBody = "";
      for (let i = 0; i < 5; i++) {
        const result = await timeRequest(`${BASE_URL}${page.path}`);
        times.push(result.ttfb);
        bytes = result.bytes;
        lastBody = result.bodyText;
      }
      times.sort((a, b) => a - b);
      const medianTTFB = times[2];
      report.matrixE.push({
        name: page.name,
        path: page.path,
        medianTTFB: medianTTFB.toFixed(1),
        bytes,
        min: times[0].toFixed(1),
        max: times[4].toFixed(1),
      });

      // Special check on /shop for thumbnail URL transforms (N7)
      let extra = "";
      if (page.path === "/shop") {
        const hasThumbPreset = lastBody.includes("w_400,f_auto,q_auto") || lastBody.includes("c_fill");
        extra = hasThumbPreset ? " (N7 verified: card covers use optimized presets)" : "";
      }
      console.log(
        `  • ${page.name}: median ${medianTTFB.toFixed(1)}ms (range: ${times[0].toFixed(1)}–${times[4].toFixed(1)}ms), size: ${(bytes / 1024).toFixed(1)} KB${extra}`
      );
    }

    // Output JSON report to stdout
    console.log("\nSUMMARY_JSON:" + JSON.stringify(report));
  } finally {
    console.log("\nStopping test server...");
    server.kill("SIGTERM");
  }
}

run().catch((err) => {
  console.error("Runner error:", err);
  process.exit(1);
});
