/**
 * API origin for browser requests. With the Vercel /api proxy, auth cookies live on
 * the frontend host; calls must use the same origin even if build-time env still
 * points at api.teachersaid.tech.
 */
export function getApiOrigin(): string {
  const configured = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
    /\/+$/,
    "",
  );

  if (typeof window === "undefined") {
    return configured;
  }

  try {
    const configuredOrigin = new URL(configured).origin;
    if (configuredOrigin !== window.location.origin) {
      return window.location.origin;
    }
  } catch {
    return window.location.origin;
  }

  return configured;
}
