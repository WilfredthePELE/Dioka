export function shouldBypassImageOptimization(src: unknown) {
  return typeof src === "string" && src.startsWith("https://")
    && !/^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//i.test(src);
}
