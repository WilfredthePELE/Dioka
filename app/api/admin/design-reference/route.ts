import { requireAdmin, failure, HttpError } from "@/lib/http";
import { hasSupabase, supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    if (!hasSupabase()) throw new HttpError(503, "Private design storage is unavailable.");
    const path = new URL(request.url).searchParams.get("path") || "";
    if (!/^customer-designs\/[a-f0-9-]{36}\.(jpg|png|webp|avif)$/i.test(path)) throw new HttpError(404, "Design reference not found.");

    const { data, error } = await supabaseServer().storage.from("dioka-private").createSignedUrl(path, 300);
    if (error || !data?.signedUrl) throw new HttpError(404, "Design reference not found.");
    return new Response(null, { status: 302, headers: { Location: data.signedUrl, "Cache-Control": "no-store" } });
  } catch (error) {
    return failure(error);
  }
}
