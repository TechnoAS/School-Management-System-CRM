import { getApiUrl } from "@/api/config";

/** Turn `/uploads/...` or R2 URLs from the API into a browser-loadable URL. */
export function resolveUploadUrl(url: string, cacheBust?: string | number): string {
  if (!url) return "";
  let resolved = url;
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
    resolved = url;
  } else if (url.startsWith("/uploads/")) {
    if (typeof window !== "undefined") {
      resolved = url;
    } else {
      const apiUrl = getApiUrl();
      if (apiUrl.startsWith("http")) {
        resolved = apiUrl.replace(/\/api\/?$/, "") + url;
      }
    }
  }
  if (cacheBust == null || cacheBust === "") return resolved;
  const sep = resolved.includes("?") ? "&" : "?";
  return `${resolved}${sep}v=${encodeURIComponent(String(cacheBust))}`;
}
