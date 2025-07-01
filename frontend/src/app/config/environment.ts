/**
 * 환경 설정 관리
 */

export interface AppConfig {
  app: {
    title: string;
    version: string;
    environment: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    enableDevtools: boolean;
    enableMockApi: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

const getEnvironmentConfig = (): AppConfig => {
  const isDevelopment = import.meta.env.DEV;

  return {
    app: {
      title: import.meta.env.VITE_APP_TITLE || 'ITCEN Solution',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE || 'development',
    },
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
    },
    features: {
      enableDevtools: isDevelopment,
      enableMockApi: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
    },
    logging: {
      level: (import.meta.env.VITE_LOG_LEVEL as AppConfig['logging']['level']) || 
             (isDevelopment ? 'debug' : 'warn'),
    },
  };
};

export const config = getEnvironmentConfig();

// 환경별 유틸리티 함수
export const isDevelopment = () => config.app.environment === 'development';
export const isProduction = () => config.app.environment === 'production';
export const isLocal = () => config.app.environment === 'local';

// 로깅 유틸리티
export const logger = {
  debug: (...args: unknown[]) => {
    if (config.logging.level === 'debug') {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (['debug', 'info'].includes(config.logging.level)) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (['debug', 'info', 'warn'].includes(config.logging.level)) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};

export default config; 