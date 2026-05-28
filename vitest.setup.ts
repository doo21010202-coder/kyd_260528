import "@testing-library/jest-dom/vitest";

// Radix UI primitives require these browser APIs in jsdom
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
window.HTMLElement.prototype.scrollIntoView = () => {};
window.HTMLElement.prototype.releasePointerCapture = () => {};
window.HTMLElement.prototype.hasPointerCapture = () => false;
