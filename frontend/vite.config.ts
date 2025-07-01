import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    
    // MUI v7 Modern Bundle 지원
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      conditions: ['mui-modern', 'module', 'browser', 'development|production']
    },
    
    // 환경 변수 정의
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __APP_ENVIRONMENT__: JSON.stringify(mode),
    },
    
    // 서버 설정
    server: {
      host: '0.0.0.0',
      port: 3000,
      watch: {
        usePolling: true,
      },
      // API 프록시 설정 (개발 환경에서 CORS 문제 해결)
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false
        }
      }
    },
    
    // 빌드 설정
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@mui/icons-material', '@mui/lab'],
            router: ['react-router-dom'],
            utils: ['axios']
          }
        }
      }
    },
    
    // 개발 환경 최적화 (React 19 + MUI v7 최적화)
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        '@mui/material', 
        '@mui/icons-material',
        '@mui/lab',
        '@emotion/react',
        '@emotion/styled'
      ]
    },
    
    // 환경별 설정
    ...(mode === 'production' && {
      base: '/',
    }),
  }
})
