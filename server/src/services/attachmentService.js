import fs from "fs/promises";
import path from "path";
import engData from "@tesseract.js-data/eng";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import Tesseract from "tesseract.js";

const TEXT_LIMIT = 12000;
const OCR_TEXT_LIMIT = 6000;
const OCR_LANGUAGE = "eng";
const { createWorker } = Tesseract;

function truncate(text) {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, TEXT_LIMIT);
}

function truncateOcr(text) {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, OCR_TEXT_LIMIT);
}

function isImage(file) {
  return file.mimetype.startsWith("image/");
}

async function extractImageText(file) {
  const worker = await createWorker(OCR_LANGUAGE, 1, {
    cacheMethod: "none",
    gzip: engData.gzip,
    langPath: engData.langPath,
  });

  try {
    const {
      data: { text },
    } = await worker.recognize(file.path);
    return truncateOcr(text);
  } finally {
    await worker.terminate();
  }
}

async function extractText(file) {
  if (
    file.mimetype.startsWith("text/") ||
    file.mimetype === "application/json"
  ) {
    return truncate(await fs.readFile(file.path, "utf8"));
  }

  if (file.mimetype === "application/pdf") {
    const buffer = await fs.readFile(file.path);
    const parser = new PDFParse({ data: buffer });
    try {
      const parsed = await parser.getText();
      return truncate(parsed.text);
    } finally {
      await parser.destroy();
    }
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: file.path });
    return truncate(result.value);
  }

  if (isImage(file)) {
    try {
      return await extractImageText(file);
    } catch (error) {
      console.warn(`OCR failed for ${file.originalname}: ${error.message}`);
      return "";
    }
  }

  return "";
}

export async function buildAttachmentMetadata(files = []) {
  return Promise.all(
    files.map(async (file) => ({
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      extractedText: await extractText(file),
    })),
  );
}

export function attachmentContext(attachments = []) {
  const readable = attachments.filter((attachment) => attachment.extractedText);
  if (!readable.length) return "";

  return readable
    .map(
      (attachment) =>
        `Attachment: ${attachment.originalName}\n${attachment.extractedText}`,
    )
    .join("\n\n");
}

export async function deleteAttachmentFiles(attachments = []) {
  await Promise.allSettled(
    attachments
      .filter((attachment) => attachment.path)
      .map((attachment) => fs.unlink(path.resolve(attachment.path))),
  );
}
