import { PaymentTypes, PlanIntervals } from '@/payment/types';
import type { WebsiteConfig } from '@/types';

/**
 * website config, without translations
 *
 * docs:
 * https://mksaas.com/docs/config/website
 */
export const websiteConfig: WebsiteConfig = {
  metadata: {
    theme: {
      defaultTheme: 'default',
      enableSwitch: true,
    },
    mode: {
      defaultMode: 'system',
      enableSwitch: true,
    },
    images: {
      ogImage: '/custom_images/front_3.png',
      // 首页logo已指向public/logos/logo.png和logo-dark.png
      logoLight: '/logos/logo.png',
      logoDark: '/logos/logo-dark.png',
    },
    social: {
      github: 'https://github.com/Sayur1n/Ai_tryon',
      twitter: 'https://twitter.com/virtugoodai',
      blueSky: 'https://bsky.app/profile/virtugoodai.bsky.social',
      discord: 'https://discord.gg/virtugoodai',
      mastodon: 'https://mastodon.social/@virtugoodai',
      linkedin: 'https://linkedin.com/company/virtugoodai',
      youtube: 'https://youtube.com/@virtugoodai',
    },
  },
  features: {
    enableDiscordWidget: false,
    enableUpgradeCard: true,
    enableAffonsoAffiliate: false,
    enablePromotekitAffiliate: false,
    enableDatafastRevenueTrack: false,
    enableTurnstileCaptcha: true,
  },
  routes: {
    defaultLoginRedirect: '/dashboard',
  },
  analytics: {
    enableVercelAnalytics: false,
    enableSpeedInsights: false,
  },
  auth: {
    enableGoogleLogin: true,
    enableGithubLogin: true,
  },
  i18n: {
    defaultLocale: 'en',
    locales: {
      en: {
        flag: '🇺🇸',
        name: 'English',
      },
      zh: {
        flag: '🇨🇳',
        name: '中文',
      },
    },
  },
  blog: {
    paginationSize: 6,
    relatedPostsSize: 3,
  },
  mail: {
    provider: 'resend',
    fromEmail: 'VirtuGood AI <support@virtugoodai.com>',
    supportEmail: 'VirtuGood AI <support@virtugoodai.com>',
  },
  newsletter: {
    provider: 'resend',
    autoSubscribeAfterSignUp: true,
  },
  storage: {
    provider: 's3',
  },
  payment: {
    provider: 'stripe',
  },
  price: {
    plans: {
      free: {
        id: 'free',
        prices: [],
        isFree: true,
        isLifetime: false,
      },
      pro: {
        id: 'pro',
        prices: [
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
            amount: 2990,
            currency: 'USD',
            interval: PlanIntervals.MONTH,
          },
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY!,
            amount: 29900,
            currency: 'USD',
            interval: PlanIntervals.YEAR,
          },
        ],
        isFree: false,
        isLifetime: false,
        recommended: true,
      },
      lifetime: {
        id: 'lifetime',
        prices: [
          {
            type: PaymentTypes.ONE_TIME,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME!,
            amount: 49900,
            currency: 'USD',
            allowPromotionCode: true,
          },
        ],
        isFree: false,
        isLifetime: true,
      },
    },
  },
};
