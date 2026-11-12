import type { NextConfig } from 'next';
const walletConnections=process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?' https://rpc.walletconnect.com https://rpc.walletconnect.org https://relay.walletconnect.com https://relay.walletconnect.org wss://relay.walletconnect.com wss://relay.walletconnect.org https://pulse.walletconnect.com https://pulse.walletconnect.org https://verify.walletconnect.com https://verify.walletconnect.org':'';
const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  serverExternalPackages: ['@electric-sql/pglite','pg'],
  outputFileTracingExcludes: {'/api/**/*':['./data/**/*','./artifacts/**/*','./video/**/*','./.env*']},
  outputFileTracingIncludes: {'/api/**/*':['./migrations/*.sql']},
  async headers() { return [{ source: '/(.*)', headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'Content-Security-Policy', value: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'${walletConnections}; frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'` }
  ] }]; }
};
export default config;
