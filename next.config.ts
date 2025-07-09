import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * https://nextjs.org/docs/app/api-reference/config/next-config-js
 */
const nextConfig: NextConfig = {
  // Docker standalone output
  ...(process.env.DOCKER_BUILD === 'true' && { output: 'standalone' }),

  /* config options here */
  devIndicators: false,

  // https://nextjs.org/docs/architecture/nextjs-compiler#remove-console
  // Remove all console.* calls in production only
  compiler: {
    // removeConsole: process.env.NODE_ENV === 'production',
  },

  // 编译性能优化
  swcMinify: true,

  // 优化webpack配置
  webpack: (config, { dev, isServer }) => {
    // 开发环境优化
    if (dev) {
      // 减少开发时的编译时间
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    // 优化模块解析
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  images: {
    // https://vercel.com/docs/image-optimization/managing-image-optimization-costs#minimizing-image-optimization-costs
    // https://nextjs.org/docs/app/api-reference/components/image#unoptimized
    // vercel has limits on image optimization, 1000 images per month
    unoptimized: process.env.DISABLE_IMAGE_OPTIMIZATION === 'true',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'html.tailus.io',
      },
      {
        protocol: 'https',
        hostname: 'help-static-aliyun-doc.aliyuncs.com',
      },
      {
        protocol: 'https',
        hostname: 'bailian-bmp-prod.oss-cn-beijing.aliyuncs.com',
      },
      {
        protocol: 'http',
        hostname: 'a1-tryon-test.oss-cn-beijing.aliyuncs.com',
      }
    ],
  },
};

/**
 * You can specify the path to the request config file or use the default one (@/i18n/request.ts)
 *
 * https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing#next-config
 */
const withNextIntl = createNextIntlPlugin();

/**
 * https://fumadocs.dev/docs/ui/manual-installation
 * https://fumadocs.dev/docs/mdx/plugin
 */
const withMDX = createMDX();

export default withMDX(withNextIntl(nextConfig));
