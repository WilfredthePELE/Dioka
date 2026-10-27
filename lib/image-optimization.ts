import sharp from "sharp";
import { HttpError } from "@/lib/http";
import { maximumFileSize } from "@/lib/media-validation";

const productImageMaxEdge = 2400;
const referenceImageMaxEdge = 2000;

export async function optimizeUploadedImage(bytes: Uint8Array, kind: "image" | "reference") {
  try {
    const result = await sharp(bytes, { failOn: "error", limitInputPixels: 40_000_000 })
      .rotate()
      .resize({
        width: kind === "image" ? productImageMaxEdge : referenceImageMaxEdge,
        height: kind === "image" ? productImageMaxEdge : referenceImageMaxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: kind === "image" ? 84 : 82, effort: 4, smartSubsample: true })
      .toBuffer();

    if (!result.length || result.length > maximumFileSize) {
      throw new HttpError(400, "This image is too detailed to optimize. Choose a smaller image.");
    }

    return { bytes: result, contentType: "image/webp" as const, extension: "webp" as const };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "This image could not be processed. Try a JPG, PNG, WebP or AVIF image.");
  }
}
