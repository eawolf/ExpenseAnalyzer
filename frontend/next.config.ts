import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/auth/:path*',
        destination: 'http://localhost:8081/api/:path*', 
      },
      {
        source: '/api-proxy/expenses/:path*',
        destination: 'http://localhost:8080/api/:path*', 
      },
    ];
  },
};

export default nextConfig;
