import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

// Component-level regressions without a browser dependency. Back/Forward is
// also checked in the browser against verify-dashboard-fixture.mjs --serve.
const require = createRequire(import.meta.url);
const source = await readFile(new URL("../src/components/dashboard/ProjectEditor.tsx", import.meta.url), "utf8");
const compile = (text) => ts.transpileModule(text, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText;
const artwork = { exports: {} };
vm.runInNewContext(compile(await readFile(new URL("../src/types/artwork.ts", import.meta.url), "utf8")), { exports: artwork.exports });
const image = { id: "test-image", storage_path: "test-project/test-image.png", alt_text: "Test artwork", width: 1, height: 1, sort_order: 0 };
const fields = { title: "Test project", slug: "test-project", project_type: "Illustration", categories: ["illustration"], sort_order: 0 };
const project = { ...fields, id: "test-project", is_published: true, updated_at: "2026-10-27T00:00:00Z", project_images: [image] };
const baseline = JSON.stringify({ fields, images: [image] });

function render({ dirty = false, busy = false, isNew = false } = {}) {
  const effects = [];
  const listeners = new Map();
  const requests = [];
  let destination;
  let stateIndex = 0;
  const state = [isNew ? null : project, fields, [image], dirty ? "old baseline" : baseline, false, busy];
  const window = {
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
    location: { replace: (url) => { destination = url; } },
  };
  const exports = {};
  vm.runInNewContext(compile(source), {
    exports, window, URL, AbortController,
    require(name) {
      if (name === "react") return {
        useState: (initial) => [stateIndex < state.length ? state[stateIndex++] : (stateIndex++, initial), () => {}],
        useRef: (current) => ({ current }),
        useEffect: (run, deps) => effects.push({ run, deps }),
      };
      if (name === "../../types/artwork") return artwork.exports;
      if (name === "./api") return {
        orderedProject: (value) => value,
        errorMessage: (error) => error.message,
        dashboardRequest: async (url, options) => {
          const body = JSON.parse(options.body);
          requests.push(body);
          return { project: { ...project, ...body } };
        },
      };
      return require(name);
    },
  });
  const tree = exports.default({ projectId: isNew ? undefined : project.id });
  const guard = effects.find(({ deps }) => deps?.length === 2 && deps.every((value) => typeof value === "boolean"));
  const cleanup = guard.run();
  return { tree, listeners, requests, cleanup, destination: () => destination };
}

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...nodes(tree.props?.children)];
}
function unload(handler) {
  const event = { prevented: false, returnValue: undefined, preventDefault() { this.prevented = true; } };
  handler?.(event);
  return event;
}

const editor = render();
const form = nodes(editor.tree).find((node) => node.type === "form");
const submitters = nodes(form).filter((node) => node.type === "button" && node.props.type === "submit");
assert.equal(submitters[0].props.value, "save", "Enter must select Save changes, not Unpublish.");
await form.props.onSubmit({ preventDefault() {}, nativeEvent: { submitter: submitters[0].props } });
assert.equal(editor.requests[0].is_published, true);
await form.props.onSubmit({ preventDefault() {}, nativeEvent: { submitter: { value: "draft" } } });
assert.equal(editor.requests[1].is_published, false, "Explicit Unpublish must still work.");
console.log("PASS Enter saves published work; explicit Unpublish still works");

for (const options of [{ dirty: true }, { busy: true }]) {
  const guarded = render(options);
  const event = unload(guarded.listeners.get("beforeunload"));
  assert.equal(event.prevented, true);
  assert.equal(event.returnValue, "");
  guarded.cleanup();
  assert.equal(guarded.listeners.has("beforeunload"), false);
}
assert.equal(editor.listeners.has("beforeunload"), false, "Saved, idle editors must not prompt.");
console.log("PASS Unsaved edits and active operations warn; saved editors do not");

const created = render({ isNew: true, dirty: true });
const newForm = nodes(created.tree).find((node) => node.type === "form");
await newForm.props.onSubmit({ preventDefault() {}, nativeEvent: { submitter: { value: "draft" } } });
assert.equal(created.destination(), `/dashboard/projects/${project.id}`);
assert.equal(unload(created.listeners.get("beforeunload")).prevented, false, "Successful creation must not trigger a discard warning.");
for (const file of ["DashboardShell.tsx", "ProjectLibrary.tsx", "ProjectEditor.tsx"]) {
  const text = await readFile(new URL(`../src/components/dashboard/${file}`, import.meta.url), "utf8");
  assert.doesNotMatch(text, /from ["']next\/(link|navigation)["']/, "Dashboard navigation must stay document-based for native Back/Forward protection.");
}
console.log("PASS Creation redirects safely and dashboard navigation stays document-based");
