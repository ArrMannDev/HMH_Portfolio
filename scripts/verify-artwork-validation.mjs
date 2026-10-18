import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Load the pure TypeScript validators without introducing a test dependency.
const source = async (path) => ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const moduleURL = (value) => `data:text/javascript;base64,${Buffer.from(value).toString("base64")}`;
const typesURL = moduleURL(await source("../src/types/artwork.ts"));
const validators = await import(moduleURL((await source("../src/lib/artworks/validation.ts")).replace('"../../types/artwork"', JSON.stringify(typesURL))));
const { projectFields, imageFields, uploadFields, uuid, version } = validators;
const id = "11111111-1111-4111-8111-111111111111";
const imageId = "22222222-2222-4222-8222-222222222222";
const fields = { title: null, slug: "test-project", project_type: "Illustration", categories: ["illustration"], is_published: false, sort_order: 0 };
const image = { id: imageId, storage_path: `${id}/${imageId}.png`, alt_text: "A test image", width: 100, height: 200 };
let checks = 0;
function check(label, fn) { fn(); checks++; console.log(`PASS ${label}`); }

check("Project fields trim copy and deduplicate categories", () => {
  assert.equal(projectFields({ ...fields, project_type: " Illustration " }).project_type, "Illustration");
  assert.deepEqual(projectFields({ ...fields, categories: ["illustration", "illustration"] }).categories, ["illustration"]);
});
check("Slugs reject paths, HTML, whitespace, uppercase and double hyphens", () => {
  for (const slug of ["../x", "<script>", "a b", "UPPER", "a--b", "-a", "a-"]) assert.throws(() => projectFields({ ...fields, slug }));
});
check("Categories are nonempty and restricted to real category values", () => {
  for (const categories of [[], ["__proto__"], ["constructor"], ["invented"], "illustration"]) assert.throws(() => projectFields({ ...fields, categories }));
});
check("Visibility and ordering cannot be coerced from untrusted values", () => {
  for (const is_published of ["true", 1, undefined]) assert.throws(() => projectFields({ ...fields, is_published }));
  for (const sort_order of [-1, 0.5, 1000001, "2"]) assert.throws(() => projectFields({ ...fields, sort_order }));
});
check("Image order is derived from array position, not client sort_order", () => {
  assert.equal(imageFields([{ ...image, sort_order: 99 }], id)[0].sort_order, 0);
});
check("Cross-project paths, traversal, URLs and executable file types fail", () => {
  for (const storage_path of [`${imageId}/x.png`, `${id}/../x.png`, "https://example.com/a.png", `${id}/x.svg`, `${id}/x.html`]) assert.throws(() => imageFields([{ ...image, storage_path }], id));
});
check("Duplicate IDs and paths are rejected", () => {
  assert.throws(() => imageFields([image, image], id));
  assert.throws(() => imageFields([image, { ...image, id }], id));
});
check("Image descriptions, dimensions and project limits are enforced", () => {
  for (const alt_text of ["", "   ", "x".repeat(501)]) assert.throws(() => imageFields([{ ...image, alt_text }], id));
  for (const width of [0, -1, 30001, 1.5, "100"]) assert.throws(() => imageFields([{ ...image, width }], id));
  assert.throws(() => imageFields(Array(25).fill(image), id));
});
check("Upload types and the 10 MB limit are enforced", () => {
  assert.equal(uploadFields({ contentType: "image/png", size: 10 * 1024 * 1024 }).extension, "png");
  for (const contentType of ["image/svg+xml", "text/html", "constructor"]) assert.throws(() => uploadFields({ contentType, size: 1 }));
  for (const size of [0, -1, 10 * 1024 * 1024 + 1, "10"]) assert.throws(() => uploadFields({ contentType: "image/png", size }));
});
check("Identifiers and optimistic concurrency versions are validated", () => {
  assert.equal(uuid(id.toUpperCase()), id);
  assert.throws(() => uuid("' or 1=1"));
  assert.throws(() => version("yesterday"));
  assert.equal(version("2026-10-18T12:00:00.123456+00:00"), "2026-10-18T12:00:00.123456+00:00");
});
console.log(`\n${checks} artwork validation checks passed.`);
