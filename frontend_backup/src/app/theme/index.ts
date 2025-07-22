/**
 * MUI v7 테마 설정 (CSS Variables + Color Schemes)
 */

import type { Shadows } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// MUI v7 CSS Variables 타입 지원
import type {} from '@mui/material/themeCssVarsAugmentation';

// 은행 프로젝트 색상 팔레트 - 차분하고 모던한 색상
const palette = {
  primary: {
    main: '#527a8a', // 차분한 블루그레이
    light: '#6b94a6', // 라이트 블루그레이
    dark: '#3e5b66', // 다크 블루그레이
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#6b7c8f', // 중성적인 그레이블루
    light: '#8a9bae', // 라이트 그레이블루
    dark: '#4f5d6f', // 다크 그레이블루
    contrastText: '#ffffff',
  },
  success: {
    main: '#5f8a68', // 차분한 녹색
    light: '#7ba582', // 라이트 녹색
    dark: '#4a6b51', // 다크 녹색
    contrastText: '#ffffff',
  },
  warning: {
    main: '#c4945a', // 차분한 주황색
    light: '#d4a975', // 라이트 주황색
    dark: '#a67c47', // 다크 주황색
    contrastText: '#ffffff',
  },
  error: {
    main: '#b85c5c', // 차분한 빨간색
    light: '#c77777', // 라이트 빨간색
    dark: '#9a4a4a', // 다크 빨간색
    contrastText: '#ffffff',
  },
  info: {
    main: '#6b94a6', // 은행 Primary Light와 동일
    light: '#8aabb8', // 라이트 정보 색상
    dark: '#527a8a', // 다크 정보 색상 (Primary와 동일)
    contrastText: '#ffffff',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// 타이포그래피 설정
const typography = {
  fontFamily: [
    'Roboto',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  h1: {
    fontSize: '2.125rem',
    fontWeight: 300,
    lineHeight: 1.167,
  },
  h2: {
    fontSize: '1.5rem',
    fontWeight: 400,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: '1.25rem',
    fontWeight: 400,
    lineHeight: 1.167,
  },
  h4: {
    fontSize: '1.125rem',
    fontWeight: 400,
    lineHeight: 1.235,
  },
  h5: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.334,
  },
  h6: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: 'none' as const, // MUI v7에서 기본값 변경
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 2.66,
    textTransform: 'uppercase' as const,
  },
};

// 간격 설정
const spacing = 8;

// 모양 설정
const shape = {
  borderRadius: 8,
};

// 그림자 설정
const shadows: Shadows = [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
  '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
  '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
  '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
  '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
  '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
  '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
  '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
  '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
  '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
  '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
  '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
  '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
  '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
  '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
  '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
  '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
  '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
  '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
  '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
  '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
  '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
];

// 공통 컴포넌트 스타일
const commonComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0px 2px 8px rgba(82, 122, 138, 0.2)',
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      // 은행 프로젝트에 맞는 버튼 스타일 개선
      containedPrimary: {
        backgroundColor: '#527a8a',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#3e5b66',
          boxShadow: '0px 3px 12px rgba(82, 122, 138, 0.3)',
        },
        '&:disabled': {
          backgroundColor: '#b0b7bb',
          color: '#ffffff',
        },
      },
      containedSecondary: {
        backgroundColor: '#6b7c8f',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#4f5d6f',
          boxShadow: '0px 3px 12px rgba(107, 124, 143, 0.3)',
        },
        '&:disabled': {
          backgroundColor: '#b0b7bb',
          color: '#ffffff',
        },
      },
      containedSuccess: {
        backgroundColor: '#5f8a68',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#4a6b51',
          boxShadow: '0px 3px 12px rgba(95, 138, 104, 0.3)',
        },
        '&:disabled': {
          backgroundColor: '#b0b7bb',
          color: '#ffffff',
        },
      },
      containedWarning: {
        backgroundColor: '#c4945a',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#a67c47',
          boxShadow: '0px 3px 12px rgba(196, 148, 90, 0.3)',
        },
        '&:disabled': {
          backgroundColor: '#b0b7bb',
          color: '#ffffff',
        },
      },
      containedError: {
        backgroundColor: '#b85c5c',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#9a4a4a',
          boxShadow: '0px 3px 12px rgba(184, 92, 92, 0.3)',
        },
        '&:disabled': {
          backgroundColor: '#b0b7bb',
          color: '#ffffff',
        },
      },
      containedInfo: {
        backgroundColor: '#6b94a6',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#527a8a',
          boxShadow: '0px 3px 12px rgba(107, 148, 166, 0.3)',
        },
        '&:disabled': {
          backgroundColor: '#b0b7bb',
          color: '#ffffff',
        },
      },
      outlinedPrimary: {
        borderColor: '#527a8a',
        color: '#527a8a',
        '&:hover': {
          borderColor: '#3e5b66',
          backgroundColor: 'rgba(82, 122, 138, 0.08)',
          color: '#3e5b66',
        },
        '&:disabled': {
          borderColor: '#b0b7bb',
          color: '#b0b7bb',
        },
      },
      outlinedSecondary: {
        borderColor: '#6b7c8f',
        color: '#6b7c8f',
        '&:hover': {
          borderColor: '#4f5d6f',
          backgroundColor: 'rgba(107, 124, 143, 0.08)',
          color: '#4f5d6f',
        },
        '&:disabled': {
          borderColor: '#b0b7bb',
          color: '#b0b7bb',
        },
      },
      outlinedSuccess: {
        borderColor: '#5f8a68',
        color: '#5f8a68',
        '&:hover': {
          borderColor: '#4a6b51',
          backgroundColor: 'rgba(95, 138, 104, 0.08)',
          color: '#4a6b51',
        },
        '&:disabled': {
          borderColor: '#b0b7bb',
          color: '#b0b7bb',
        },
      },
      outlinedWarning: {
        borderColor: '#c4945a',
        color: '#c4945a',
        '&:hover': {
          borderColor: '#a67c47',
          backgroundColor: 'rgba(196, 148, 90, 0.08)',
          color: '#a67c47',
        },
        '&:disabled': {
          borderColor: '#b0b7bb',
          color: '#b0b7bb',
        },
      },
      outlinedError: {
        borderColor: '#b85c5c',
        color: '#b85c5c',
        '&:hover': {
          borderColor: '#9a4a4a',
          backgroundColor: 'rgba(184, 92, 92, 0.08)',
          color: '#9a4a4a',
        },
        '&:disabled': {
          borderColor: '#b0b7bb',
          color: '#b0b7bb',
        },
      },
      textPrimary: {
        color: '#527a8a',
        '&:hover': {
          backgroundColor: 'rgba(82, 122, 138, 0.08)',
          color: '#3e5b66',
        },
        '&:disabled': {
          color: '#b0b7bb',
        },
      },
      textSecondary: {
        color: '#6b7c8f',
        '&:hover': {
          backgroundColor: 'rgba(107, 124, 143, 0.08)',
          color: '#4f5d6f',
        },
        '&:disabled': {
          color: '#b0b7bb',
        },
      },
      textSuccess: {
        color: '#5f8a68',
        '&:hover': {
          backgroundColor: 'rgba(95, 138, 104, 0.08)',
          color: '#4a6b51',
        },
        '&:disabled': {
          color: '#b0b7bb',
        },
      },
      textWarning: {
        color: '#c4945a',
        '&:hover': {
          backgroundColor: 'rgba(196, 148, 90, 0.08)',
          color: '#a67c47',
        },
        '&:disabled': {
          color: '#b0b7bb',
        },
      },
      textError: {
        color: '#b85c5c',
        '&:hover': {
          backgroundColor: 'rgba(184, 92, 92, 0.08)',
          color: '#9a4a4a',
        },
        '&:disabled': {
          color: '#b0b7bb',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
    },
  },
};

// MUI v7 CSS Variables와 Color Schemes를 활용한 테마 생성
export const theme = createTheme({
  // CSS Variables 활성화 (타입 에러 임시 해결)
  ...({
    cssVariables: {
      colorSchemeSelector: 'class', // 클래스 기반 색상 스키마 전환
      cssVarPrefix: 'itcen', // 커스텀 CSS 변수 접두사
    },
  } as any),

  // Color Schemes 정의 (라이트/다크 모드)
  colorSchemes: {
    light: {
      palette: {
        ...palette,
        background: {
          default: '#f8f9fb', // 은행 프로젝트 배경색
          paper: '#ffffff',
        },
        text: {
          primary: '#2d3e50', // 은행 프로젝트 텍스트 색상
          secondary: '#6c7b7f', // 은행 프로젝트 보조 텍스트
          disabled: '#b0b7bb', // 은행 프로젝트 비활성 텍스트
        },
      },
    },
    dark: {
      palette: {
        ...palette,
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.7)',
          disabled: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
  },

  // 공통 설정
  typography,
  spacing,
  shape,
  shadows,
  components: commonComponents,
});

// 레거시 지원을 위한 개별 테마 (필요시 사용)
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...palette,
    background: {
      default: '#f8f9fb', // 은행 프로젝트 배경색
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3e50', // 은행 프로젝트 텍스트 색상
      secondary: '#6c7b7f', // 은행 프로젝트 보조 텍스트
      disabled: '#b0b7bb', // 은행 프로젝트 비활성 텍스트
    },
  },
  typography,
  spacing,
  shape,
  shadows,
  components: commonComponents,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...palette,
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
  },
  typography,
  spacing,
  shape,
  shadows,
  components: commonComponents,
});

export default theme;
