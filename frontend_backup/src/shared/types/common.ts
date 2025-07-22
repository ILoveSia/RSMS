// UI 컴포넌트 공통 타입 정의
export type Size = 'small' | 'medium' | 'large';
export type Color = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
export type Variant = 'contained' | 'outlined' | 'text';

// 기본 컴포넌트 Props 인터페이스
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
  sx?: any; // Material-UI sx prop
}

// 폼 컴포넌트 공통 타입
export interface FormComponentProps extends BaseComponentProps {
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

// 선택 옵션 타입
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

// 데이터 그리드 컬럼 타입
export interface DataGridColumn<T = any> {
  field: keyof T;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  renderCell?: (params: {
    value: T[keyof T];
    row: T;
    field: keyof T;
    index: number;
  }) => React.ReactNode;
  renderHeader?: (params: {
    field: keyof T;
    headerName: string;
    sortable?: boolean;
  }) => React.ReactNode;
}

// 페이지네이션 타입
export interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

// 로딩 상태 타입
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// 검색 필터 타입
export interface SearchFilter {
  key: string;
  label: string;
  value: string;
  type?: 'text' | 'select' | 'date' | 'number';
  options?: SelectOption[];
}

// 알림 타입
export interface NotificationOptions {
  severity?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  closable?: boolean;
}

// 모달 관리 타입
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// 테이블 액션 타입
export interface TableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'contained' | 'outlined' | 'text';
}

// 폼 필드 타입
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'multiselect' | 'date' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}
