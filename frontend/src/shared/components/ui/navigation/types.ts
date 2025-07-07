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

// Breadcrumb 아이템 타입
export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}

// Breadcrumb 컴포넌트 타입
export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
  itemsBeforeCollapse?: number;
  itemsAfterCollapse?: number;
  expandText?: string;
  renderItem?: (item: BreadcrumbItem, index: number) => ReactNode;
}

// Pagination 컴포넌트 타입
export interface PaginationProps extends BaseComponentProps {
  count: number;
  page: number;
  onChange: (page: number) => void;
  variant?: 'text' | 'outlined' | 'contained';
  shape?: 'rounded' | 'circular';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'standard';
  disabled?: boolean;
  hideNextButton?: boolean;
  hidePrevButton?: boolean;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  siblingCount?: number;
  boundaryCount?: number;
  renderItem?: (props: any) => ReactNode;
}

// Step 아이템 타입
export interface StepItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  completed?: boolean;
  error?: boolean;
  disabled?: boolean;
  optional?: boolean;
  optionalLabel?: string;
}

// Stepper 컴포넌트 타입
export interface StepperProps extends BaseComponentProps {
  steps: StepItem[];
  activeStep: number;
  orientation?: 'horizontal' | 'vertical';
  alternativeLabel?: boolean;
  nonLinear?: boolean;
  connector?: ReactNode;
  onStepClick?: (stepIndex: number) => void;
  completed?: boolean;
  error?: boolean;
}
