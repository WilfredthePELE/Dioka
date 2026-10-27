import { randomUUID } from "node:crypto";
import { assertOrigin, failure, HttpError, limit } from "@/lib/http";
import { hasSupabase, supabaseServer } from "@/lib/supabase-server";
import { inspectUpload, uploadForm } from "@/lib/media-validation";
import { optimizeUploadedImage } from "@/lib/image-optimization";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertOrigin(request);
    await limit(request, "custom-design-reference", 8);
    if (!hasSupabase()) throw new HttpError(503, "Private design uploads are not connected yet. Please try again later or continue without a reference photo.");

    const form = await uploadForm(request);
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "Choose a design image to upload.");

    const bytes = new Uint8Array(await file.arrayBuffer());
    inspectUpload(bytes, file.type, "reference");
    const optimized = await optimizeUploadedImage(bytes, "reference");
    const path = `customer-designs/${randomUUID()}.${optimized.extension}`;
    const { error } = await supabaseServer().storage.from("dioka-private").upload(path, optimized.bytes, {
      contentType: optimized.contentType,
      cacheControl: "0",
      upsert: false,
    });
    if (error) throw new Error("The design photo could not be stored privately. Please try again.");

    return Response.json({ path }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return failure(error);
  }
}
