const apiOrigin = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000').origin; }
  catch { return 'http://localhost:5000'; }
})();

const csp = [
  "default-src 'self'", `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'", `img-src 'self' data: blob: ${apiOrigin}`, "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}`, "object-src 'none'", "base-uri 'self'", "form-action 'self'",
  "frame-ancestors 'none'", process.env.NODE_ENV === 'production' && apiOrigin.startsWith('https://') ? 'upgrade-insecure-requests' : '',
].filter(Boolean).join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    ] }];
  },
};

export default nextConfig;
