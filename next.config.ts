import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.anga9.com',
          },
        ],
        destination: 'https://anga9.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
