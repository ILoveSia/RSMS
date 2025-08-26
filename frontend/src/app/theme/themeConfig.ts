/**
 * Material-UI 테마 설정
 * 라이트/다크 모드 지원을 위한 테마 구성
 */

import { createTheme } from '@mui/material/styles';

// 공통 테마 설정
const commonTheme: any = {
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    fontSize: 14,
    h1: { fontSize: '2rem', fontWeight: 600 },
    h2: { fontSize: '1.75rem', fontWeight: 600 },
    h3: { fontSize: '1.5rem', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    h5: { fontSize: '1.125rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '0.875rem', lineHeight: 1.5 },
    body2: { fontSize: '0.75rem', lineHeight: 1.4 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          fontWeight: 600,
        },
        sizeSmall: {
          height: 32,
          minWidth: 80,
          fontSize: '0.875rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
        },
        head: {
          fontWeight: 'bold',
        },
      },
    },
  },
};

// 라이트 테마 - 금융권 적합 색상
export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#2C5282',      // 신뢰감 있는 네이비 블루
      light: '#4A7BA7',     // 연한 네이비 블루
      dark: '#1A3A52',      // 진한 네이비
      contrastText: '#fff',
    },
    secondary: {
      main: '#64748B',      // 차분한 그레이 블루
      light: '#94A3B8',     // 연한 그레이 블루
      dark: '#475569',      // 진한 그레이 블루
      contrastText: '#fff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#666666',
    },
    divider: '#e0e0e0',
    action: {
      hover: '#f5f5f5',
      selected: '#e3f2fd',
    },
  },
  components: {
    ...commonTheme.components,
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--bank-surface)',
          color: 'var(--bank-text-primary)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--bank-border)',
          },
        },
      },
    },
  },
});

// 다크 테마 - 금융권 적합 색상 (다크모드)
export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#4A7BA7',      // 밝은 네이비 블루 (다크모드용)
      light: '#6B9AC4',     // 더 밝은 네이비
      dark: '#2C5282',      // 진한 네이비
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#94A3B8',      // 밝은 그레이 블루 (다크모드용)
      light: '#B4C1D4',     // 더 밝은 그레이 블루
      dark: '#64748B',      // 진한 그레이 블루
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
    divider: '#333333',
    action: {
      hover: '#333333',
      selected: '#1e3a5f',
    },
  },
  components: {
    ...commonTheme.components,
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--bank-surface)',
          color: 'var(--bank-text-primary)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--bank-border)',
          },
        },
        input: {
          color: 'var(--bank-text-primary)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--bank-bg-paper)',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--bank-bg-secondary)',
          borderBottom: '1px solid var(--bank-border)',
        },
      },
    },
  },
});

// CSS 변수 업데이트 함수 - 금융권 적합 색상
export const updateCssVariables = (isDark: boolean) => {
  const root = document.documentElement;
  
  if (isDark) {
    root.style.setProperty('--bank-primary', '#4A7BA7');
    root.style.setProperty('--bank-primary-light', '#6B9AC4');
    root.style.setProperty('--bank-primary-dark', '#2C5282');
    root.style.setProperty('--bank-secondary', '#94A3B8');
    root.style.setProperty('--bank-secondary-dark', '#64748B');
    root.style.setProperty('--bank-bg-secondary', '#1e1e1e');
    root.style.setProperty('--bank-bg-hover', '#333333');
    root.style.setProperty('--bank-border', '#333333');
    root.style.setProperty('--bank-text-primary', '#ffffff');
    root.style.setProperty('--bank-text-secondary', '#b3b3b3');
    // 상태 색상
    root.style.setProperty('--bank-success', '#10B981');
    root.style.setProperty('--bank-warning', '#F59E0B');
    root.style.setProperty('--bank-error', '#EF4444');
    root.style.setProperty('--bank-info', '#06B6D4');
  } else {
    root.style.setProperty('--bank-primary', '#2C5282');
    root.style.setProperty('--bank-primary-light', '#4A7BA7');
    root.style.setProperty('--bank-primary-dark', '#1A3A52');
    root.style.setProperty('--bank-secondary', '#64748B');
    root.style.setProperty('--bank-secondary-dark', '#475569');
    root.style.setProperty('--bank-bg-secondary', '#F8FAFC');
    root.style.setProperty('--bank-bg-hover', '#EFF6FF');
    root.style.setProperty('--bank-border', '#E2E8F0');
    root.style.setProperty('--bank-text-primary', '#1E293B');
    root.style.setProperty('--bank-text-secondary', '#64748B');
    // 상태 색상 - 부드럽고 전문적인 톤
    root.style.setProperty('--bank-success', '#059669');
    root.style.setProperty('--bank-warning', '#D97706');
    root.style.setProperty('--bank-error', '#DC2626');
    root.style.setProperty('--bank-info', '#0891B2');
    // 버튼별 색상
    root.style.setProperty('--bank-button-primary', '#2C5282');
    root.style.setProperty('--bank-button-excel', '#059669');
    root.style.setProperty('--bank-button-danger', '#B91C1C');
    root.style.setProperty('--bank-button-secondary', '#64748B');
  }
};