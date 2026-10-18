// Isolated contract/UI fixture. Never uses the project's real Supabase credentials.
// Requires a production build. --serve keeps the loopback fixture open for visual QA.
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { readFile } from "node:fs/promises";

const appPort = 3105;
const mockPort = 5105;
const appOrigin = `http://127.0.0.1:${appPort}`;
const mockOrigin = `http://127.0.0.1:${mockPort}`;
const adminId = "11111111-1111-4111-8111-111111111111";
const pendingId = "22222222-2222-4222-8222-222222222222";
const projects = new Map();
const files = new Map();
const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
const user = (id) => ({ id, aud: "authenticated", role: "authenticated", email: "dashboard-test@example.invalid", app_metadata: { provider: "google" }, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" });
function cookie(id) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: id, role: "authenticated", aud: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000), iss: `${mockOrigin}/auth/v1` })}.dGVzdC1vbmx5`;
  return `sb-127-auth-token=base64-${encode({ access_token: token, refresh_token: "isolated-test-refresh-token", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: user(id) })}`;
}
function authId(req) {
  try { return JSON.parse(Buffer.from((req.headers.authorization || "").split(".")[1], "base64url").toString()).sub; }
  catch { return null; }
}
function body(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; req.on("data", (chunk) => chunks.push(chunk)); req.on("end", () => resolve(Buffer.concat(chunks))); req.on("error", reject);
  });
}
function send(res, data, status = 200) { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(data)); }
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", appOrigin);
  res.setHeader("Access-Control-Allow-Headers", "content-type,x-upsert");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  const url = new URL(req.url, mockOrigin);
  const path = url.pathname;
  const id = authId(req);
  const admin = id === adminId;
  const filter = (name) => url.searchParams.get(name)?.replace(/^eq\./, "");
  try {
    if (path === "/fixture-login") {
      res.writeHead(302, { "Set-Cookie": `${cookie(adminId)}; Path=/; HttpOnly; SameSite=Lax`, Location: `${appOrigin}/dashboard` }); res.end(); return;
    }
    if (path === "/auth/v1/user") { send(res, id ? user(id) : { message: "Missing session" }, id ? 200 : 401); return; }
    if (path === "/rest/v1/admin_users") { send(res, admin ? [{ user_id: adminId }] : []); return; }
    if (path === "/rest/v1/projects") {
      if (req.method === "POST") {
        if (!admin) return send(res, {}, 403);
        const input = JSON.parse(await body(req));
        if ([...projects.values()].some((p) => p.slug === input.slug)) return send(res, { code: "23505" }, 409);
        const project = { ...input, id: randomUUID(), project_images: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        projects.set(project.id, project); return send(res, project, 201);
      }
      if (req.method === "DELETE") {
        const p = projects.get(filter("id"));
        if (admin && p?.updated_at === filter("updated_at")) { projects.delete(p.id); return send(res, [{ id: p.id }]); }
        return send(res, []);
      }
      const list = [...projects.values()].filter((p) => (admin || p.is_published) && (!filter("id") || p.id === filter("id")) && (!filter("is_published") || p.is_published));
      return send(res, req.headers.accept?.includes("vnd.pgrst.object") ? list[0] : list);
    }
    if (path === "/rest/v1/project_images") {
      const list = [...projects.values()].filter((p) => admin || p.is_published).flatMap((p) => p.project_images.map((i) => ({ ...i, projects: { is_published: p.is_published } }))).filter((i) => i.id === filter("id"));
      return send(res, list);
    }
    if (path === "/rest/v1/rpc/save_artwork_project") {
      const input = JSON.parse(await body(req));
      const project = projects.get(input.p_id);
      if (!admin) return send(res, { code: "42501" }, 403);
      if (!project) return send(res, { code: "P0002" }, 404);
      if (project.updated_at !== input.p_expected_updated_at) return send(res, { code: "40001" }, 409);
      if (input.p_project.is_published && input.p_images.length === 0) return send(res, { code: "23514" }, 400);
      Object.assign(project, input.p_project, { project_images: input.p_images, updated_at: new Date().toISOString() });
      return send(res, project.id);
    }
    const storage = "/storage/v1";
    if (path.startsWith(`${storage}/object/upload/sign/artworks/`)) {
      const file = path.split("/artworks/")[1];
      if (req.method === "POST") {
        if (!admin) return send(res, {}, 403);
        return send(res, { url: `/object/upload/sign/artworks/${file}?token=fixture-only` });
      }
      if (req.method === "PUT") {
        const data = await new Response(await body(req), { headers: { "Content-Type": req.headers["content-type"] } }).formData();
        const uploaded = data.get("");
        files.set(file, { bytes: Buffer.from(await uploaded.arrayBuffer()), contentType: uploaded.type });
        return send(res, { Key: `artworks/${file}` });
      }
    }
    if (path.startsWith(`${storage}/object/info/artworks/`)) {
      const file = path.split("/artworks/")[1];
      return files.has(file) ? send(res, { size: files.get(file).bytes.length, content_type: files.get(file).contentType }) : send(res, { message: "Not found" }, 404);
    }
    if (path.startsWith(`${storage}/object/sign/artworks/`)) {
      const file = path.split("/artworks/")[1];
      if (req.method === "POST") {
        const published = [...projects.values()].some((p) => p.is_published && p.project_images.some((i) => i.storage_path === file));
        if (!files.has(file) || (!admin && !published)) return send(res, { message: "Not found" }, 404);
        return send(res, { signedURL: `/object/sign/artworks/${file}?token=fixture-only` });
      }
      const stored = files.get(file);
      res.writeHead(200, { "Content-Type": stored?.contentType || "image/png" }); res.end(stored?.bytes || pixel); return;
    }
    send(res, { error: `Unsupported fixture request: ${req.method} ${path}` }, 404);
  } catch (error) { send(res, { error: error.message }, 500); }
});
server.listen(mockPort, "127.0.0.1"); await once(server, "listening");
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(appPort)], {
  env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: mockOrigin, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_isolated_test", ARTWORK_SOURCE: "supabase" }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
});
let logs = "";
app.stdout.on("data", (chunk) => { logs += chunk; }); app.stderr.on("data", (chunk) => { logs += chunk; });
const cleanup = () => { app.kill(); server.close(); };
process.on("SIGINT", () => { cleanup(); process.exit(0); }); process.on("SIGTERM", () => { cleanup(); process.exit(0); });

try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${appOrigin}/dashboard/login`)).status === 200) { ready = true; break; } } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(ready, `Fixture app failed to start: ${logs}`);
  const request = async (path, method = "GET", data, role = "admin") => fetch(`${appOrigin}${path}`, {
    method, redirect: "manual", headers: { ...(role === "signed-out" ? {} : { Cookie: cookie(role === "admin" ? adminId : pendingId) }), Origin: appOrigin, ...(data ? { "Content-Type": "application/json" } : {}) }, body: data ? JSON.stringify(data) : undefined,
  });
  let checks = 0;
  async function check(label, fn) { await fn(); checks++; console.log(`PASS ${label}`); }
  await check("Approved admin sees dashboard; pending account is denied", async () => {
    assert.equal((await request("/dashboard")).status, 200);
    assert.equal((await request("/api/admin/projects", "GET", undefined, "pending")).status, 403);
  });
  const fields = { title: "Isolated QA fixture", slug: "isolated-qa-fixture", project_type: "Illustration", categories: ["illustration"], sort_order: 0, is_published: false };
  let project;
  await check("Create draft, reject duplicate slugs and invalid categories", async () => {
    const created = await request("/api/admin/projects", "POST", fields); assert.equal(created.status, 201); project = (await created.json()).project;
    assert.equal((await request("/api/admin/projects", "POST", fields)).status, 409);
    assert.equal((await request("/api/admin/projects", "POST", { ...fields, categories: ["__proto__"] })).status, 400);
    assert.equal((await request("/api/admin/projects", "POST", { ...fields, is_published: true })).status, 400);
  });
  await check("Drafts are absent from the public API", async () => {
    assert.equal((await (await request("/api/artworks", "GET", undefined, "signed-out")).json()).projects.length, 0);
  });
  const images = [];
  await check("Signed uploads go directly to Storage and are verified before saving", async () => {
    for (let i = 0; i < 2; i++) {
      const permission = await request(`/api/admin/projects/${project.id}/uploads`, "POST", { contentType: "image/png", size: pixel.length }); assert.equal(permission.status, 200);
      const data = await permission.json();
      const form = new FormData(); form.append("cacheControl", "300"); form.append("", new Blob([pixel], { type: "image/png" }), "fixture.png");
      assert.equal((await fetch(data.signedUrl, { method: "PUT", body: form })).status, 200);
      images.push({ id: data.id, storage_path: data.path, alt_text: `Isolated QA image ${i + 1}`, width: 1, height: 1, sort_order: i });
    }
    assert.equal((await request(`/api/admin/projects/${project.id}/uploads`, "POST", { contentType: "image/svg+xml", size: 10 })).status, 400);
  });
  await check("Publish grouped images and preserve cover order", async () => {
    const result = await request(`/api/admin/projects/${project.id}`, "PUT", { ...fields, is_published: true, updated_at: project.updated_at, images: [...images].reverse() });
    assert.equal(result.status, 200, await result.clone().text()); project = (await result.json()).project;
    assert.equal(project.project_images[0].id, images[1].id);
    const published = (await (await request("/api/artworks", "GET", undefined, "signed-out")).json()).projects;
    assert.equal(published.length, 1); assert.equal(published[0].images.length, 2);
    assert.equal((await request(`/api/artworks/images/${images[1].id}`, "GET", undefined, "signed-out")).status, 307);
  });
  await check("Stale saves, missing alt text and empty published projects are rejected", async () => {
    assert.equal((await request(`/api/admin/projects/${project.id}`, "PUT", { ...fields, updated_at: "2020-01-01T00:00:00.000Z", images })).status, 409);
    assert.equal((await request(`/api/admin/projects/${project.id}`, "PUT", { ...fields, updated_at: project.updated_at, images: [{ ...images[0], alt_text: "" }] })).status, 400);
    assert.equal((await request(`/api/admin/projects/${project.id}`, "PUT", { ...fields, is_published: true, updated_at: project.updated_at, images: [] })).status, 400);
  });
  await check("Unpublish immediately hides project and prevents new public image links", async () => {
    const result = await request(`/api/admin/projects/${project.id}`, "PUT", { ...fields, updated_at: project.updated_at, images }); assert.equal(result.status, 200); project = (await result.json()).project;
    assert.equal((await (await request("/api/artworks", "GET", undefined, "signed-out")).json()).projects.length, 0);
    assert.equal((await request(`/api/artworks/images/${images[0].id}`, "GET", undefined, "signed-out")).status, 404);
    assert.equal((await request(`/api/admin/images/${images[0].id}`)).status, 307);
  });
  await check("Deletion requires confirmation and retains originals", async () => {
    assert.equal((await request(`/api/admin/projects/${project.id}`, "DELETE", { updated_at: project.updated_at })).status, 400);
    assert.equal((await request(`/api/admin/projects/${project.id}`, "DELETE", { updated_at: project.updated_at, confirm: "DELETE" })).status, 200);
    assert.equal(files.size, 2); assert.equal(projects.size, 0);
  });
  console.log(`\n${checks} isolated API contract checks passed. This fixture does not execute PostgreSQL or verify real Supabase RLS.`);
  if (process.argv.includes("--serve")) {
    const seedId = randomUUID();
    const seedImages = [];
    for (const [index, name] of ["art-work3.jpg", "art-work4.jpg"].entries()) {
      const imageId = randomUUID(); const path = `${seedId}/${imageId}.jpg`;
      files.set(path, { bytes: await readFile(new URL(`../src/assets/images/${name}`, import.meta.url)), contentType: "image/jpeg" });
      seedImages.push({ id: imageId, storage_path: path, alt_text: `Local QA campaign visual ${index + 1}`, width: 1280, height: 1280, sort_order: index });
    }
    projects.set(seedId, { ...fields, id: seedId, title: "Isolated QA fixture", is_published: true, project_images: seedImages, updated_at: new Date().toISOString() });
    console.log(`Visual QA login: ${mockOrigin}/fixture-login`);
    await new Promise(() => {});
  }
} catch (error) { console.error(error); console.error(logs); process.exitCode = 1; }
finally { cleanup(); }
