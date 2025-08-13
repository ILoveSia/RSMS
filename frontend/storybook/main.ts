import type { StorybookConfig } from '@storybook/react-vite';

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
  viteFinal: async (cfg) => {
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
