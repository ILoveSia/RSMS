/**
 * 금융권 적합 색상 팔레트
 * 전문적이고 신뢰감 있는 색상 시스템
 */

// 메인 색상 팔레트
export const bankColors = {
  // Primary - 네이비 블루 계열
  primary: {
    main: '#2C5282',      // 메인 네이비
    light: '#4A7BA7',     // 연한 네이비
    dark: '#1A3A52',      // 진한 네이비
    darker: '#152A3E',    // 더 진한 네이비
    contrastText: '#FFFFFF',
  },
  
  // Secondary - 그레이 블루 계열
  secondary: {
    main: '#64748B',      // 차분한 그레이 블루
    light: '#94A3B8',     // 연한 그레이 블루
    dark: '#475569',      // 진한 그레이 블루
    contrastText: '#FFFFFF',
  },
  
  // Status Colors - 전문적인 톤
  status: {
    success: '#059669',   // 차분한 초록
    successLight: '#10B981',
    successBg: '#D1FAE5',
    
    warning: '#D97706',   // 부드러운 주황
    warningLight: '#F59E0B',
    warningBg: '#FED7AA',
    
    error: '#DC2626',     // 절제된 빨강
    errorLight: '#EF4444',
    errorBg: '#FEE2E2',
    
    info: '#0891B2',      // 차분한 하늘색
    infoLight: '#06B6D4',
    infoBg: '#E0F2FE',
    
    neutral: '#64748B',   // 중립 그레이
    neutralLight: '#94A3B8',
    neutralBg: '#F1F5F9',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    hover: '#EFF6FF',
    selected: '#DBEAFE',
  },
  
  // Border Colors
  border: {
    primary: '#E2E8F0',
    secondary: '#CBD5E1',
    focus: '#2C5282',
  },
  
  // Text Colors
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    disabled: '#CBD5E1',
  },
  
  // Chart Colors - 대시보드용
  chart: {
    primary: '#2C5282',
    secondary: '#4A7BA7',
    tertiary: '#64748B',
    quaternary: '#94A3B8',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#0891B2',
  },
};

// 버튼 스타일 프리셋
export const buttonStyles = {
  primary: {
    backgroundColor: bankColors.primary.main,
    color: bankColors.primary.contrastText,
    '&:hover': {
      backgroundColor: bankColors.primary.dark,
    },
    '&:active': {
      backgroundColor: bankColors.primary.darker,
    },
  },
  
  secondary: {
    backgroundColor: bankColors.secondary.main,
    color: bankColors.secondary.contrastText,
    '&:hover': {
      backgroundColor: bankColors.secondary.dark,
    },
  },
  
  success: {
    backgroundColor: bankColors.status.success,
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#047857',
    },
    '&:active': {
      backgroundColor: '#065F46',
    },
  },
  
  error: {
    backgroundColor: '#B91C1C',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#991B1B',
    },
    '&:active': {
      backgroundColor: '#7F1D1D',
    },
  },
};

// DataGrid 상태 스타일
export const statusStyles = {
  planned: {
    color: bankColors.status.neutral,
    backgroundColor: bankColors.status.neutralBg,
  },
  inProgress: {
    color: bankColors.status.info,
    backgroundColor: bankColors.status.infoBg,
  },
  completed: {
    color: bankColors.status.success,
    backgroundColor: bankColors.status.successBg,
  },
  cancelled: {
    color: bankColors.status.error,
    backgroundColor: bankColors.status.errorBg,
  },
  review: {
    color: bankColors.status.warning,
    backgroundColor: bankColors.status.warningBg,
  },
  approved: {
    color: bankColors.status.info,
    backgroundColor: bankColors.status.infoBg,
  },
  published: {
    color: bankColors.status.success,
    backgroundColor: bankColors.status.successBg,
  },
};

// 대시보드 카드 스타일
export const dashboardCardStyles = {
  stats: {
    backgroundColor: bankColors.background.primary,
    border: `1px solid ${bankColors.border.primary}`,
    borderRadius: '8px',
    padding: '20px',
    '& .MuiTypography-h5': {
      color: bankColors.primary.main,
      fontWeight: 600,
    },
    '& .MuiTypography-caption': {
      color: bankColors.text.secondary,
    },
  },
  
  chart: {
    backgroundColor: bankColors.background.primary,
    border: `1px solid ${bankColors.border.primary}`,
    borderRadius: '8px',
    padding: '20px',
  },
  
  workflow: {
    backgroundColor: bankColors.background.secondary,
    border: `1px solid ${bankColors.border.primary}`,
    borderRadius: '8px',
    padding: '16px',
  },
};

// 다크모드 색상 팔레트
export const darkBankColors = {
  // Primary - 다크모드용 밝은 톤
  primary: {
    main: '#4A7BA7',      // 밝은 네이비 (다크모드)
    light: '#6B9AC4',     // 더 밝은 네이비
    dark: '#2C5282',      // 기본 네이비
    darker: '#1A3A52',    // 진한 네이비
    contrastText: '#FFFFFF',
  },
  
  // Secondary - 다크모드용 그레이 블루
  secondary: {
    main: '#94A3B8',      // 밝은 그레이 블루
    light: '#B4C1D4',     // 더 밝은 그레이 블루
    dark: '#64748B',      // 기본 그레이 블루
    contrastText: '#FFFFFF',
  },
  
  // Status Colors - 다크모드용 밝은 톤
  status: {
    success: '#10B981',   // 밝은 초록
    successLight: '#34D399',
    successBg: '#064E3B',
    
    warning: '#F59E0B',   // 밝은 주황
    warningLight: '#FBBF24',
    warningBg: '#92400E',
    
    error: '#EF4444',     // 밝은 빨강
    errorLight: '#F87171',
    errorBg: '#7F1D1D',
    
    info: '#06B6D4',      // 밝은 하늘색
    infoLight: '#22D3EE',
    infoBg: '#164E63',
    
    neutral: '#94A3B8',   // 밝은 그레이
    neutralLight: '#CBD5E1',
    neutralBg: '#334155',
  },
  
  // Background Colors
  background: {
    primary: '#1E293B',
    secondary: '#0F172A',
    tertiary: '#334155',
    hover: '#475569',
    selected: '#2563EB',
  },
  
  // Border Colors
  border: {
    primary: '#475569',
    secondary: '#64748B',
    focus: '#4A7BA7',
  },
  
  // Text Colors
  text: {
    primary: '#F8FAFC',
    secondary: '#E2E8F0',
    tertiary: '#CBD5E1',
    disabled: '#64748B',
  },
  
  // Chart Colors - 다크모드 대시보드용
  chart: {
    primary: '#4A7BA7',
    secondary: '#6B9AC4',
    tertiary: '#94A3B8',
    quaternary: '#B4C1D4',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
  },
};

export default bankColors;