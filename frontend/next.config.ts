import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api-proxy/auth/:path*',
        destination: `${process.env.AUTH_SERVICE_URL || 'http://localhost:8081'}/api/:path*`, 
      },
      {
        source: '/api-proxy/expenses/:path*',
        destination: `${process.env.EXPENSE_SERVICE_URL || 'http://localhost:8080'}/api/:path*`, 
      },
    ];
  },
};

export default nextConfig;
