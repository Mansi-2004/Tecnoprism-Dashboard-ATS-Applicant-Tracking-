import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value) => ({
    matches: false,
    media,
    onchange,
    addListener) => {},
    removeListener) => {},
    addEventListener) => {},
    removeEventListener) => {},
    dispatchEvent) => {},
  }),
});
