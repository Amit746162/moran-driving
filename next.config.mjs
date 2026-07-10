/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Coach photos/videos live in Supabase Storage + external CDNs.
    // Add hostnames here as new storage providers are introduced.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    // Keep server bundles lean for large dependencies.
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
};

export default nextConfig;
