import assert from "node:assert/strict";

// Read-only/denied requests only. Safe against a configured local development server.
const base = new URL(process.argv[2] || "http://localhost:3000");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a loopback server.");
const id = "11111111-1111-4111-8111-111111111111";
const paths = ["/api/admin/projects", `/api/admin/projects/${id}`, `/api/admin/images/${id}`];
let checks = 0;
async function check(label, fn) { await fn(); checks++; console.log(`PASS ${label}`); }
const request = (path, options) => fetch(new URL(path, base), { ...options, redirect: "manual" });

await check("Every dashboard route protects signed-out visitors", async () => {
  for (const path of ["/dashboard", "/dashboard/projects/new", `/dashboard/projects/${id}`]) {
    const response = await request(path);
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get("location"), base).pathname, "/dashboard/login");
    assert.match(response.headers.get("cache-control"), /no-store/);
  }
});
await check("All artwork read endpoints require verified administrator access", async () => {
  for (const path of paths) {
    const response = await request(path);
    assert.equal(response.status, 401);
    assert.match(response.headers.get("cache-control"), /no-store/);
  }
});
await check("All artwork mutations require a session, not just a valid Origin", async () => {
  for (const [method, path] of [["POST", paths[0]], ["PUT", paths[1]], ["DELETE", paths[1]], ["POST", `${paths[1]}/uploads`]]) {
    const response = await request(path, { method, headers: { Origin: base.origin, "Content-Type": "application/json" }, body: "{}" });
    assert.equal(response.status, 401);
  }
});
await check("All artwork mutations reject cross-site and origin-less requests", async () => {
  for (const [method, path] of [["POST", paths[0]], ["PUT", paths[1]], ["DELETE", paths[1]], ["POST", `${paths[1]}/uploads`]]) {
    for (const origin of [undefined, "https://untrusted.example"]) {
      const response = await request(path, { method, headers: { ...(origin ? { Origin: origin } : {}), "Content-Type": "application/json" }, body: "{}" });
      assert.equal(response.status, 403);
    }
  }
});
await check("Upload and image routes expose no unexpected mutation methods", async () => {
  assert.equal((await request(`${paths[1]}/uploads`)).status, 405);
  assert.equal((await request(paths[2], { method: "POST" })).status, 405);
});
await check("Public project data excludes private storage paths and draft fields", async () => {
  const response = await request("/api/artworks");
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(Array.isArray(data.projects));
  const serialized = JSON.stringify(data);
  assert.ok(!serialized.includes("storage_path"));
  assert.ok(!serialized.includes("is_published"));
  assert.ok(!serialized.includes("access_token"));
});
console.log(`\n${checks} artwork API access checks passed. Run the SQL migration and verify authenticated CRUD with your account.`);
