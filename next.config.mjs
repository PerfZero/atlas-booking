/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.booking.atlas.kz',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'booking.atlas.kz',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
