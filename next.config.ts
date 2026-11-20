import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Cloud preview host for this workspace. Update if the preview hostname changes.
  allowedDevOrigins: [
    'pv-94c028f3b255-244e1b95-7298-4042-806f-223225ad3ad2.style.dev',
    'pv-94c028f3b255-4190831d-9d35-4b84-be21-8d41ac56d66d.style.dev',
  ],
}

export default nextConfig
