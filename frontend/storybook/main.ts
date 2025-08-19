import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    './stories/**/*.mdx',
    './stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      compilerOptions: {
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
      },
      propFilter: () => true,
      tsconfigPath: '../tsconfig.app.json',
    },
  },
  viteFinal: async (cfg) => {
    // Align aliases/defines with app's Vite config so imports like '@/...' work in Storybook
    cfg.resolve = {
      ...cfg.resolve,
      alias: {
        ...(cfg.resolve?.alias as Record<string, string> | undefined),
        '@': path.resolve(__dirname, '../src'),
      },
    };

    cfg.define = {
      ...cfg.define,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __APP_ENVIRONMENT__: JSON.stringify(process.env.NODE_ENV || 'development'),
      global: 'globalThis',
    };

    cfg.server = {
      ...cfg.server,
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // 백엔드 주소/포트에 맞게 변경
          changeOrigin: true,
          secure: false,
        },
      },
    };
    return cfg;
  },
};

export default config;
