import type { ReactNode } from 'react';
import type { SxProps } from '@mui/system';
import type { Theme } from '@mui/material/styles';

// 기본 컴포넌트 Props 인터페이스
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
  sx?: SxProps<Theme>;
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

// DatePicker 컴포넌트 타입


// FileUpload 컴포넌트 타입
export interface FileUploadProps extends FormComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  files?: File[];
  preview?: boolean;
  dropzone?: boolean;
  variant?: 'button' | 'dropzone' | 'input';
  buttonText?: string;
  dropzoneText?: string;
  uploadProgress?: number[];
  loading?: boolean;
  showFileList?: boolean;
  allowedFileTypes?: string[];
  onError?: (error: string) => void;
}
