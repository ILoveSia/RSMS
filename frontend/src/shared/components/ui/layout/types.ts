import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { ReactNode } from 'react';

// 기본 컴포넌트 Props 인터페이스
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
  sx?: SxProps<Theme>;
}

// Card 컴포넌트 타입
export interface CardProps extends BaseComponentProps {
  variant?: 'elevation' | 'outlined';
  elevation?: number;
  square?: boolean;
  raised?: boolean;
  header?: ReactNode;
  title?: string;
  subtitle?: string;
  media?: {
    image?: string;
    alt?: string;
    height?: number;
    component?: string;
  };
  actions?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

// Drawer 컴포넌트 타입
export interface DrawerProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  variant?: 'permanent' | 'persistent' | 'temporary';
  width?: number | string;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  hideCloseButton?: boolean;
  disableBackdropClick?: boolean;
  elevation?: number;
  keepMounted?: boolean;
}

// Tab 아이템 타입
export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

// Tabs 컴포넌트 타입
export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  orientation?: 'horizontal' | 'vertical';
  indicatorColor?: 'primary' | 'secondary';
  textColor?: 'primary' | 'secondary' | 'inherit';
  scrollButtons?: 'auto' | 'desktop' | 'on' | 'off';
  allowScrollButtonsMobile?: boolean;
  centered?: boolean;
  lazy?: boolean; // 탭 내용 지연 로딩
  keepMounted?: boolean; // 탭 내용 유지
}
