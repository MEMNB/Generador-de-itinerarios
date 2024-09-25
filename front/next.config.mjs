/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /supabase/,
      loader: 'ignore-loader'
    });
    return config;
  },
};

export default nextConfig;
