import assert from "node:assert/strict";

// Anonymous, read-only verification. Never uses an admin session or API secret.
const base = new URL(process.argv[2] || "http://localhost:3000");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a loopback preview.");
const response = await fetch(new URL("/api/artworks", base), { cache: "no-store", signal: AbortSignal.timeout(20000) });
assert.equal(response.status, 200);
const { projects } = await response.json();
assert.equal(projects.length, 21, "All 21 imported projects should be published.");
assert.equal(new Set(projects.map((p) => p.id)).size, 21);
assert.equal(new Set(projects.map((p) => p.slug)).size, 21);
const images = projects.flatMap((p) => p.images);
assert.equal(images.length, 34);
assert.equal(new Set(images.map((image) => image.src)).size, 34);
assert.ok(projects.every((p) => p.images.length > 0 && p.categories.length > 0));
console.log("PASS anonymous API returns 21 unique published projects and 34 related images");
for (const slug of ["apple-illustrations", "calendar-illustrations", "chocolate-illustrations", "flower-illustrations", "gift-illustrations"]) {
  assert.equal(projects.find((p) => p.slug === slug).images.length, 3);
}
for (const slug of ["social-media-campaign", "fragrance-advertising", "haircare-advertising"]) {
  assert.equal(projects.find((p) => p.slug === slug).images.length, 2);
}
console.log("PASS illustration series and related campaign images remain grouped");
const page = await fetch(base, { cache: "no-store", signal: AbortSignal.timeout(20000) });
assert.equal(page.status, 200);
const html = await page.text();
const work = html.match(/<section id="work"[\s\S]*?<\/section>/)?.[0];
assert.ok(work, "Work section is rendered.");
const galleryImages = [...work.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1]);
assert.equal(galleryImages.length, 9, "Only the first nine covers should render before scrolling.");
assert.ok(work.includes("Load more work"), "Scroll loading retains a manual fallback.");
assert.ok(galleryImages.every((src) => src.startsWith("/api/artworks/images/")), "The live section must not use static gallery images.");
for (const id of ["home", "experience", "education", "contact"]) assert.ok(html.includes(`id="${id}"`));
console.log("PASS homepage renders database-backed covers and preserves the other sections");
for (let offset = 0; offset < images.length; offset += 4) {
  await Promise.all(images.slice(offset, offset + 4).map(async (image) => {
    assert.ok(image.src.startsWith("/api/artworks/images/"));
    const imageResponse = await fetch(new URL(image.src, base), { redirect: "manual", signal: AbortSignal.timeout(20000) });
    assert.equal(imageResponse.status, 307);
    assert.match(imageResponse.headers.get("cache-control"), /no-store/);
    const signed = new URL(imageResponse.headers.get("location"));
    assert.equal(signed.protocol, "https:");
    assert.ok(signed.pathname.startsWith("/storage/v1/object/sign/artworks/"));
  }));
}
console.log("PASS all 34 public image routes authorize published Storage objects");
const firstImage = await fetch(new URL(images[0].src, base), { signal: AbortSignal.timeout(20000) });
assert.equal(firstImage.status, 200);
assert.match(firstImage.headers.get("content-type"), /^image\/jpeg/);
const bytes = new Uint8Array(await firstImage.arrayBuffer());
assert.equal(bytes[0], 0xff); assert.equal(bytes[1], 0xd8);
console.log("PASS an anonymous visitor can download an original JPEG through the public gallery");
