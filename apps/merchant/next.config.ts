import { config, withAnalyzer } from '@nzc/next-config';
import type { NextConfig } from 'next';
import { env } from '~/env';

let nextConfig: NextConfig = config;

if (env.ANALYZE) {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
