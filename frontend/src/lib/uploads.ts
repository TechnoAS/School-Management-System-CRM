import { getApiUrl } from "@/api/config";

/** Turn `/uploads/...` paths from the API into a browser-loadable URL. */
export function resolveUploadUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    // In the browser, keep same-origin paths so Vite/nginx can proxy /uploads.
    if (typeof window !== "undefined") {
      return url;
    }
    const apiUrl = getApiUrl();
    if (apiUrl.startsWith("http")) {
      return apiUrl.replace(/\/api\/?$/, "") + url;
    }
    return url;
  }
  return url;
}
