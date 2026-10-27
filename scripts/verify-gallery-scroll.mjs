import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

// Exercise the real component's state and observer callbacks without a DOM dependency.
const require = createRequire(import.meta.url);
const source = await readFile(new URL("../src/components/Work.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText;
const projects = Array.from({ length: 21 }, (_, index) => ({
  id: `project-${index}`, projectType: `Project ${index}`, categories: [index < 5 ? "illustration" : "advertising"],
  images: [0, 1, 2].map((number) => ({ src: `/test-${index}-${number}.jpg`, alt: `Test ${index}`, width: 1, height: 1, aspectRatio: "square" })),
}));

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...nodes(tree.props?.children)];
}
function harness({ supportsObserver = true, data = projects } = {}) {
  const states = [], refs = [], observers = [];
  let stateIndex, refIndex, effects, cleanup = [];
  let focused;
  class Observer {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, window: supportsObserver ? { IntersectionObserver: Observer } : {}, IntersectionObserver: Observer,
    require(name) {
      if (name === "react") return {
        useState(initial) {
          const index = stateIndex++;
          if (!(index in states)) states[index] = initial;
          return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
        },
        useRef(initial) { return refs[refIndex++] ||= { current: initial }; },
        useMemo: (fn) => fn(), useEffect: (fn) => effects.push(fn),
      };
      if (name === "../types/artwork") return { categoryLabels: { advertising: "Advertising", illustration: "Illustration" } };
      if (name === "../lib/image") return { imageSrc: (src) => src };
      return require(name);
    },
  });
  function render() {
    cleanup.forEach((fn) => fn?.());
    stateIndex = refIndex = 0; effects = [];
    const tree = exports.default({ projects: data });
    const all = nodes(tree);
    const cards = all.filter((node) => node.type?.name === "ArtworkCard");
    all.find((node) => node.props?.id === "artwork-gallery").props.ref.current = {
      querySelectorAll: () => cards.map((_, index) => ({ focus: () => { focused = index; } })),
    };
    const more = all.find((node) => node.props?.className === "work-load-more");
    if (more) more.props.ref.current = {};
    cleanup = effects.map((fn) => fn());
    return { all, cards, more: all.find((node) => node.type === "button" && node.props["aria-controls"] === "artwork-gallery") };
  }
  return { render, observers, focused: () => focused, states };
}

const gallery = harness();
assert.equal(gallery.render().cards.length, 9);
const firstObserver = gallery.observers.at(-1);
firstObserver.callback([{ isIntersecting: false }]);
assert.equal(gallery.states[1], 9);
firstObserver.callback([{ isIntersecting: true }]);
firstObserver.callback([{ isIntersecting: true }]);
assert.equal(gallery.render().cards.length, 18, "One intersection must add only one batch.");
gallery.observers.at(-1).callback([{ isIntersecting: true }]);
const complete = gallery.render();
assert.equal(complete.cards.length, 21);
assert.equal(complete.more, undefined);
assert.equal(new Set(complete.cards.map((card) => card.props.artwork.id)).size, 21);
console.log("PASS Scroll loading reveals 9, 18, then 21 projects without duplicates");

const advertising = complete.all.find((node) => node.type === "button" && node.props.children === "Advertising");
advertising.props.onClick();
const filtered = gallery.render();
assert.equal(filtered.cards.length, 9);
assert.ok(filtered.cards.every((card) => card.props.artwork.categories.includes("advertising")));
const oldObserver = gallery.observers.at(-1);
filtered.all.find((node) => node.type === "button" && node.props.children === "Illustration").props.onClick();
const illustrations = gallery.render();
oldObserver.callback([{ isIntersecting: true }]);
assert.equal(gallery.states[1], 9, "A disconnected category observer must not grow the new category.");
assert.equal(illustrations.cards.length, 5);
assert.equal(illustrations.more, undefined);
illustrations.cards[0].props.onOpen(illustrations.cards[0].props.artwork);
assert.equal(gallery.states[2].images.length, 3, "Related image groups must stay intact.");
console.log("PASS Category changes reset the batch and preserve related image groups");

const fallback = harness({ supportsObserver: false });
fallback.render().more.props.onClick();
assert.equal(fallback.render().cards.length, 18);
assert.equal(fallback.focused(), 9, "Manual loading must focus the first newly added artwork.");
assert.equal(harness({ data: [] }).render().more, undefined);
assert.equal(harness({ data: projects.slice(0, 9) }).render().more, undefined);
console.log("PASS Manual fallback, keyboard focus, empty and single-batch galleries work");
