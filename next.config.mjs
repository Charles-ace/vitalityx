/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push(
      'pino-pretty',
      'lokijs',
      'encoding',
      '@x402/evm/upto/client',
      '@x402/evm/exact/client',
      '@x402/core/client',
      '@x402/svm/exact/client',
      '@x402/evm'
    );
    return config;
  },
};

export default nextConfig;
