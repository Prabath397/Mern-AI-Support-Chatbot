import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("../src/api/http.js", () => ({
  api: {
    defaults: { headers: { common: {} } },
    get: vi.fn(() => Promise.reject(new Error("Not authenticated"))),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
  attachAuthToken: vi.fn(),
}));

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});
