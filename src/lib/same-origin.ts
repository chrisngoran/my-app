/** True when the request comes from this site's own pages (browsers always send Origin on a POST). */
export function fromThisSite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
