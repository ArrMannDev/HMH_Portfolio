import assert from "node:assert/strict";

// Uses no account credentials and never follows the Google sign-in redirect.
const base = new URL(process.argv[2] || "http://localhost:3000");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a local preview URL.");

async function request(path, options = {}) {
  return fetch(new URL(path, base), { ...options, redirect: "manual" });
}

function assertPrivate(response) {
  assert.match(response.headers.get("cache-control") || "", /no-store/);
  assert.match(response.headers.get("cache-control") || "", /private/);
}

let checks = 0;
async function check(label, verify) {
  await verify();
  checks += 1;
  console.log(`PASS ${label}`);
}

await check("Public portfolio still renders", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const id of ["home", "work", "experience", "education", "contact"]) {
    assert.ok(html.includes(`id="${id}"`));
  }
});

await check("Sign-in page posts to the API route", async () => {
  const response = await request("/dashboard/login");
  assert.equal(response.status, 200);
  assertPrivate(response);
  const html = await response.text();
  assert.ok(html.includes('action="/api/auth/google"'));
  assert.ok(html.includes("Continue with Google"));
});

await check("Signed-out account page redirects to sign-in", async () => {
  const response = await request("/account");
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location"), base).pathname, "/dashboard/login");
});

await check("Unknown error parameters are not rendered as objects or raw HTML", async () => {
  for (const value of ["__proto__", "constructor", "<script>unsafe</script>"]) {
    const response = await request(`/dashboard/login?error=${encodeURIComponent(value)}`);
    assert.equal(response.status, 200);
    assert.ok(!(await response.text()).includes("<script>unsafe</script>"));
  }
});

await check("Signed-out session and administrator APIs return 401", async () => {
  for (const path of ["/api/auth/session", "/api/admin/session"]) {
    const response = await request(path);
    assert.equal(response.status, 401);
    assertPrivate(response);
    const body = await response.json();
    assert.notEqual(body.isAdmin, true);
    assert.equal(body.access_token, undefined);
    assert.equal(body.refresh_token, undefined);
  }
});

await check("Authentication mutations reject GET requests", async () => {
  for (const path of ["/api/auth/google", "/api/auth/logout"]) {
    assert.equal((await request(path)).status, 405);
  }
});

await check("Authentication mutations reject cross-origin and origin-less POSTs", async () => {
  for (const path of ["/api/auth/google", "/api/auth/logout"]) {
    assert.equal((await request(path, { method: "POST" })).status, 403);
    assert.equal((await request(path, {
      method: "POST",
      headers: { Origin: "https://untrusted.example", "Sec-Fetch-Site": "cross-site" },
    })).status, 403);
  }
});

await check("Missing-code and cancelled callbacks cannot redirect off-site", async () => {
  for (const query of ["?next=https://untrusted.example", "?error=access_denied&next=//untrusted.example"]) {
    const response = await request(`/api/auth/callback${query}`);
    assert.equal(response.status, 303);
    assertPrivate(response);
    const destination = new URL(response.headers.get("location"), base);
    assert.equal(destination.origin, base.origin);
    assert.equal(destination.pathname, "/dashboard/login");
  }
});

await check("Google sign-in uses PKCE, an API callback, and HTTP-only cookies", async () => {
  const response = await request("/api/auth/google", {
    method: "POST",
    headers: { Origin: base.origin, "X-Forwarded-Host": "untrusted.example" },
  });
  assert.equal(response.status, 303);
  assertPrivate(response);
  const destination = new URL(response.headers.get("location"));
  assert.equal(destination.pathname, "/auth/v1/authorize");
  assert.equal(destination.searchParams.get("provider"), "google");
  assert.equal(destination.searchParams.get("redirect_to"), `${base.origin}/api/auth/callback`);
  assert.equal(destination.searchParams.get("code_challenge_method")?.toLowerCase(), "s256");
  assert.ok(destination.searchParams.get("code_challenge"));
  const cookies = response.headers.getSetCookie();
  assert.ok(cookies.some((cookie) => cookie.includes("code-verifier") && /httponly/i.test(cookie)));
  assert.ok(cookies.every((cookie) => /samesite=lax/i.test(cookie)));
});

await check("Signed-out sign-out is safe and returns to sign-in", async () => {
  const response = await request("/api/auth/logout", {
    method: "POST",
    headers: { Origin: base.origin },
  });
  assert.equal(response.status, 303);
  assertPrivate(response);
  const destination = new URL(response.headers.get("location"), base);
  assert.equal(destination.pathname, "/dashboard/login");
  assert.equal(destination.searchParams.get("signed_out"), "1");
});

console.log(`\n${checks} authentication checks passed. Live Google sign-in still requires a human account.`);
