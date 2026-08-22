import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const recognize = vi.fn();
const terminate = vi.fn();
const createWorker = vi.fn();

vi.mock("tesseract.js", () => ({
  default: {
    createWorker,
  },
}));

vi.mock("@tesseract.js-data/eng", () => ({
  default: {
    code: "eng",
    gzip: true,
    langPath: "local-lang-path",
  },
}));

describe("attachmentService", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("AI_PROVIDER", "groq");
    vi.stubEnv("AI_API_KEY", "test-key");
    recognize.mockReset();
    terminate.mockReset();
    createWorker.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("extracts OCR text from image attachments", async () => {
    createWorker.mockResolvedValue({
      recognize,
      terminate,
    });
    recognize.mockResolvedValue({
      data: {
        text: " Invoice total Rs. 2500 ",
      },
    });

    const { buildAttachmentMetadata } =
      await import("../src/services/attachmentService.js");
    const [attachment] = await buildAttachmentMetadata([
      {
        originalname: "invoice.png",
        filename: "stored-invoice.png",
        mimetype: "image/png",
        size: 1234,
        path: "uploads/stored-invoice.png",
      },
    ]);

    expect(createWorker).toHaveBeenCalledWith("eng", 1, {
      cacheMethod: "none",
      gzip: true,
      langPath: "local-lang-path",
    });
    expect(recognize).toHaveBeenCalledWith("uploads/stored-invoice.png");
    expect(terminate).toHaveBeenCalled();
    expect(attachment.extractedText).toBe("Invoice total Rs. 2500");
  });

  it("skips image OCR when a vision provider can inspect the upload", async () => {
    vi.stubEnv("AI_PROVIDER", "gemini");

    const { buildAttachmentMetadata } =
      await import("../src/services/attachmentService.js");
    const [attachment] = await buildAttachmentMetadata([
      {
        originalname: "screenshot.png",
        filename: "stored-screenshot.png",
        mimetype: "image/png",
        size: 1234,
        path: "uploads/stored-screenshot.png",
      },
    ]);

    expect(createWorker).not.toHaveBeenCalled();
    expect(attachment.extractedText).toBe("");
  });
});
