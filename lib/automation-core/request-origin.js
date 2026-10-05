// Next.js may use its internal listen hostname in request.url. Host is the
// browser's request target; arbitrary forwarded-host headers are not trusted.
export function requestOrigin(request) {
  try {
    const url = new URL(request.url);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = request.headers.get('host');
    if (!host) return url.origin;
    if (/[\s/\\?#@]/.test(host)) return null;
    const target = new URL(`${url.protocol}//${host}`);
    return target.origin;
  } catch { return null; }
}

export function isSameOriginRequest(request) {
  try {
    if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
    const raw = request.headers.get('origin');
    if (!raw || raw === 'null') return false;
    const origin = new URL(raw);
    if (origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) return false;
    return origin.origin === requestOrigin(request);
  } catch { return false; }
}
