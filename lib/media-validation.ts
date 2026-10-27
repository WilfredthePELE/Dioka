import { HttpError } from "@/lib/http";
export const maximumFileSize = 8 * 1024 * 1024;
export function inspectUpload(bytes: Uint8Array, mime: string, kind: string) {
  if (!bytes.length || bytes.length > maximumFileSize) throw new HttpError(400, "Choose a file smaller than 8 MB.");
  const hex = Buffer.from(bytes.slice(0, 12)).toString("hex"), ascii = Buffer.from(bytes.slice(0, 32)).toString("ascii");
  const detected = hex.startsWith("ffd8ff") ? ["image/jpeg", "jpg"] : hex.startsWith("89504e470d0a1a0a") ? ["image/png", "png"] : ascii.startsWith("RIFF") && ascii.slice(8,12) === "WEBP" ? ["image/webp", "webp"] : ascii.slice(4,8) === "ftyp" && /avif|avis/.test(ascii.slice(8)) ? ["image/avif", "avif"] : ascii.startsWith("%PDF-") ? ["application/pdf", "pdf"] : null;
  const isImage = Boolean(detected?.[0].startsWith("image/"));
  if (!detected || detected[0] !== mime || (kind === "image" || kind === "reference" ? !isImage : kind === "document" ? mime !== "application/pdf" : true)) throw new HttpError(400, "Use a JPG, PNG, WebP or AVIF image, or a PDF for a private document. The file contents must match its type.");
  return { contentType: detected[0], extension: detected[1], bucket: kind === "image" ? "dioka-products" : "dioka-private" };
}
export async function uploadForm(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data;")) throw new HttpError(400, "Choose a file to upload.");
  const maximum = maximumFileSize + 65536;
  if (Number(request.headers.get("content-length") || 0) > maximum) throw new HttpError(413, "File upload is too large.");
  if (!request.body) throw new HttpError(400, "Choose a file to upload.");
  const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > maximum) { await reader.cancel(); throw new HttpError(413, "File upload is too large."); } chunks.push(value); } } finally { reader.releaseLock(); }
  try { return await new Response(new Uint8Array(Buffer.concat(chunks)), { headers: { "Content-Type": contentType } }).formData(); } catch { throw new HttpError(400, "The upload could not be read."); }
}
