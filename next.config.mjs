/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем standalone output для правильной сборки
  output: 'standalone',
  // Настройка для копирования статических файлов в standalone режиме
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Используем фиксированный buildId вместо Git-информации
  generateBuildId: async () => {
    return 'build-id-no-git';
  },
  // Добавляем заголовки для отключения сервис-воркера
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: 'none',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/s3-proxy/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Настройка rewrites для перенаправления запросов к S3-прокси
  async rewrites() {
    return [
      {
        source: '/s3-proxy/:path*',
        destination: '/api/s3-proxy/:path*',
      },
    ];
  },
  // Добавляем редиректы с корневых маршрутов на локализованные версии
  async redirects() {
    return [
      {
        source: '/',
        destination: '/uk',
        permanent: true,
      },
      {
        source: '/blog',
        destination: '/uk/blog',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/uk/blog/:slug',
        permanent: true,
      },
      {
        source: '/cases',
        destination: '/uk/cases',
        permanent: true,
      },
      {
        source: '/cases/:slug',
        destination: '/uk/cases/:slug',
        permanent: true,
      },
    ];
  },
  // Отключаем кеширование webpack для предотвращения ошибок с файловой системой
  webpack: (config, { dev, isServer }) => {
    // Отключаем кеширование в режиме разработки
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  // Опции для повышения стабильности сборки
  onDemandEntries: {
    // Период в мс, в течение которого страница должна оставаться в памяти
    maxInactiveAge: 60 * 1000,
    // Максимальное количество страниц, которые должны оставаться в памяти
    pagesBufferLength: 5,
  },
  // Настройка для оптимизации изображений
  images: {
    domains: ['s3.us-east-1.amazonaws.com', 'crmcustoms.site', 'crmcustoms.site.s3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.us-east-1.amazonaws.com',
        pathname: '/crmcustoms.site/**',
      },
      {
        protocol: 'https',
        hostname: 'crmcustoms.site.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/crmcustoms.site/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      }
    ],
    unoptimized: true,
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 дней
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [
      '@radix-ui/react-dialog', 
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-navigation-menu',
      'recharts'
    ],
  },
}

export default nextConfig
