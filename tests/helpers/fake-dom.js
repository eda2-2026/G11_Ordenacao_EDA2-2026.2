class FakeElement {
  constructor({ value = "", textContent = "", disabled = false } = {}) {
    this.value = value;
    this.textContent = textContent;
    this.disabled = disabled;
    this.dataset = {};
    this.style = {};
    this.className = "";
    this.children = [];
    this.listeners = new Map();
    this.attributes = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    event.target = this;

    for (const listener of this.listeners.get(event.type) ?? []) {
      listener(event);
    }

    return true;
  }

  click() {
    return this.dispatchEvent({ type: "click" });
  }

  replaceChildren(...nodes) {
    this.children = [...nodes];
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
}

class FakeDocument {
  constructor(elements) {
    this.elements = elements;
    this.body = new FakeElement();
    this.readyState = "complete";
  }

  querySelector(selector) {
    return this.elements.get(selector) ?? null;
  }

  createElement(tag) {
    const element = new FakeElement();
    element.tagName = tag.toUpperCase();
    return element;
  }
}

export function createFakeRankingDocument({ quantidade = "100", seed = "42" } = {}) {
  const elements = new Map([
    ["#dataset-form", new FakeElement()],
    ["#dataset-quantity", new FakeElement({ value: quantidade })],
    ["#dataset-seed", new FakeElement({ value: seed })],
    ["#generate-dataset", new FakeElement()],
    ["#dataset-status", new FakeElement()],
    ["#ranking-form", new FakeElement()],
    ["#criterion-select", new FakeElement({ value: "kd" })],
    ["#criterion-description", new FakeElement()],
    ["#algorithm-select", new FakeElement({ value: "quick" })],
    ["#top-n", new FakeElement({ value: "10" })],
    ["#run-ranking", new FakeElement({ disabled: true })],
    ["#ranking-status", new FakeElement()],
    ["#ranking-body", new FakeElement()],
    ["#metric-time", new FakeElement()],
    ["#metric-comparisons", new FakeElement()],
    ["#metric-moves", new FakeElement()],
    ["#metric-swaps", new FakeElement()],
    ["#compare-algorithms", new FakeElement({ disabled: true })],
    ["#comparison-status", new FakeElement()],
    ["#comparison-winner", new FakeElement()],
    ["#comparison-body", new FakeElement()],
    ["#benchmark-criterion", new FakeElement({ value: "kd" })],
    ["#run-benchmark", new FakeElement()],
    ["#benchmark-status", new FakeElement()],
    ["#benchmark-body", new FakeElement()],
    ["#download-benchmark", new FakeElement({ disabled: true })],
  ]);

  const document = new FakeDocument(elements);

  return {
    document,
    get: (selector) => elements.get(selector),
  };
}
