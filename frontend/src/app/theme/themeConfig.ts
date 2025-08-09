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

// 라이트 테마
export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
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
});

// 다크 테마
export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#bbdefb',
      dark: '#42a5f5',
      contrastText: '#000',
    },
    secondary: {
      main: '#ce93d8',
      light: '#e1bee7',
      dark: '#ab47bc',
      contrastText: '#000',
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderBottom: '1px solid #333333',
        },
      },
    },
  },
});

// CSS 변수 업데이트 함수
export const updateCssVariables = (isDark: boolean) => {
  const root = document.documentElement;
  
  if (isDark) {
    root.style.setProperty('--bank-primary', '#90caf9');
    root.style.setProperty('--bank-primary-dark', '#42a5f5');
    root.style.setProperty('--bank-bg-secondary', '#1e1e1e');
    root.style.setProperty('--bank-bg-hover', '#333333');
    root.style.setProperty('--bank-border', '#333333');
    root.style.setProperty('--bank-text-primary', '#ffffff');
    root.style.setProperty('--bank-text-secondary', '#b3b3b3');
  } else {
    root.style.setProperty('--bank-primary', '#1976d2');
    root.style.setProperty('--bank-primary-dark', '#1565c0');
    root.style.setProperty('--bank-bg-secondary', '#f5f5f5');
    root.style.setProperty('--bank-bg-hover', '#e3f2fd');
    root.style.setProperty('--bank-border', '#e0e0e0');
    root.style.setProperty('--bank-text-primary', '#212121');
    root.style.setProperty('--bank-text-secondary', '#666666');
  }
};