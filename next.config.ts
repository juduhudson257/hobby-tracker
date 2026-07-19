import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Force environment variables to be defined or fallback to a dummy key during build time
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_ZW5vdWdoLW1hcnRpbi01MS5jbGVyay5hY2NvdW50cy5kZXYk',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/',
  }
};

export default nextConfig;
