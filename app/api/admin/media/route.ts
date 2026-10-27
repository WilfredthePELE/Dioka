import { randomUUID } from "node:crypto";
import { assertOrigin, requireAdmin, failure, HttpError, limit } from "@/lib/http";
import { hasSupabase, supabaseServer } from "@/lib/supabase-server";
import { inspectUpload, uploadForm } from "@/lib/media-validation";
import { optimizeUploadedImage } from "@/lib/image-optimization";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await requireAdmin();
    if (!hasSupabase()) return Response.json({ enabled: false, assets: [] }, { headers: { "Cache-Control": "no-store" } });
    if (new URL(request.url).searchParams.get("status") === "1") return Response.json({ enabled: true }, { headers: { "Cache-Control": "no-store" } });
    const client = supabaseServer();
    const { data, error } = await client.from("dioka_media").select("id,bucket,path,original_name,content_type,size_bytes,created_at").order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error("Media catalogue unavailable. Apply the Supabase media migration.");
    const assets = await Promise.all(data.map(async asset => {
      if (asset.bucket === "dioka-products") return { ...asset, url: client.storage.from(asset.bucket).getPublicUrl(asset.path).data.publicUrl };
      const signed = await client.storage.from(asset.bucket).createSignedUrl(asset.path, 300);
      if (signed.error) throw new Error("Could not open the private document.");
      return { ...asset, url: signed.data.signedUrl };
    }));
    return Response.json({ enabled: true, assets }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    assertOrigin(request); const user = await requireAdmin(); await limit(request, "media", 20);
    const client = supabaseServer(), form = await uploadForm(request), file = form.get("file"), kind = String(form.get("kind") || "image");
    if (!(file instanceof File)) throw new HttpError(400, "Choose a file to upload.");
    const originalBytes = new Uint8Array(await file.arrayBuffer()), checked = inspectUpload(originalBytes, file.type, kind);
    const optimized = kind === "image"
      ? await optimizeUploadedImage(originalBytes, "image")
      : kind === "reference"
        ? await optimizeUploadedImage(originalBytes, "reference")
        : null;
    const bytes = optimized?.bytes ?? originalBytes;
    const contentType = optimized?.contentType ?? checked.contentType;
    const extension = optimized?.extension ?? checked.extension;
    const id = randomUUID(), path = id + "." + extension;
    const uploaded = await client.storage.from(checked.bucket).upload(path, bytes, { contentType, cacheControl: "31536000", upsert: false });
    if (uploaded.error) throw new Error("Upload failed. Check the Supabase bucket configuration.");
    const asset = { id, bucket: checked.bucket, path, original_name: file.name.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 200), content_type: contentType, size_bytes: bytes.length, uploaded_by: user.id };
    const saved = await client.from("dioka_media").insert(asset);
    if (saved.error) { await client.storage.from(checked.bucket).remove([path]); throw new Error("Could not save the uploaded file."); }
    const url = kind === "image" ? client.storage.from(checked.bucket).getPublicUrl(path).data.publicUrl : null;
    return Response.json({ asset: { ...asset, url } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
