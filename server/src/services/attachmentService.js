import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

const TEXT_LIMIT = 12000;

function truncate(text) {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, TEXT_LIMIT);
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
    const parsed = await pdfParse(buffer);
    return truncate(parsed.text);
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: file.path });
    return truncate(result.value);
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
