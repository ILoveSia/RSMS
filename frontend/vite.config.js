import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      // 안정적인 react 플러그인을 사용합니다...
      react(),
    ],

    // 가장 기본적인 경로 별칭 설정
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // 코드에서 process.env.npm_package_version 같은 값을 사용할 수 있도록 추가합니다.
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __APP_ENVIRONMENT__: JSON.stringify(mode),
      global: 'globalThis',
    },

    // 개발 서버에 꼭 필요한 설정들을 다시 추가합니다.
    server: {
      // 외부에서도 접속할 수 있도록 host를 설정합니다.
      host: '0.0.0.0',
      // 기존에 사용하던 3000번 포트를 다시 설정합니다.
      port: 3000,
      // Hot reload 및 watch 설정
      watch: {
        usePolling: true,
        interval: 1000,
      },
      // API 프록시 설정
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
