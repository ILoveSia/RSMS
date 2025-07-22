import React, { forwardRef, useCallback, useRef, useState } from 'react';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useLoading } from '../feedback/LoadingProvider';
import { useToastHelpers } from '../feedback/ToastProvider';
import type { BaseComponentProps } from '@/shared/types/common';

// 파일 업로드 상태
export type FileUploadStatus = 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';

// 업로드 파일 정보
export interface UploadFile {
  id: string;
  file: File;
  status: FileUploadStatus;
  progress: number;
  error?: string;
  url?: string;
  serverId?: string | number;
}

// 서버 업로드 응답
export interface UploadResponse {
  id: string | number;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  path?: string;
}

// 서버 업로드 API
export interface ServerFileUploadApi {
  uploadFile: (file: File, onProgress?: (progress: number) => void) => Promise<UploadResponse>;
  deleteFile: (fileId: string | number) => Promise<void>;
  getFileUrl: (fileId: string | number) => string;
}

export interface ServerFileUploadProps extends BaseComponentProps {
  // 서버 API
  api: ServerFileUploadApi;

  // 파일 설정
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  allowedFileTypes?: string[];

  // 초기 파일 목록
  initialFiles?: UploadFile[];

  // 이벤트 핸들러
  onFilesChange?: (files: UploadFile[]) => void;
  onUploadSuccess?: (file: UploadFile, response: UploadResponse) => void;
  onUploadError?: (file: UploadFile, error: string) => void;
  onFileRemove?: (file: UploadFile) => void;

  // UI 설정
  variant?: 'button' | 'dropzone';
  buttonText?: string;
  dropzoneText?: string;
  preview?: boolean;
  showFileList?: boolean;

  // 자동 업로드
  autoUpload?: boolean;

  // 상태
  disabled?: boolean;
  loading?: boolean;

  // 스타일
  fullWidth?: boolean;

  // 폼 관련
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

/**
 * 서버 연동 FileUpload 컴포넌트
 *
 * 실제 서버와 연동되는 파일 업로드 컴포넌트
 * 자동 업로드, 진행률 표시, 에러 처리 등을 지원
 */
const ServerFileUpload = forwardRef<HTMLDivElement, ServerFileUploadProps>(
  (
    {
      api,
      accept = '*/*',
      multiple = false,
      maxSize = 10 * 1024 * 1024, // 10MB
      maxFiles = 10,
      allowedFileTypes = [],
      initialFiles = [],
      onFilesChange,
      onUploadSuccess,
      onUploadError,
      onFileRemove,
      variant = 'button',
      buttonText = '파일 선택',
      dropzoneText = '파일을 드래그하거나 클릭하여 업로드',
      preview = false,
      showFileList = true,
      autoUpload = true,
      disabled = false,
      loading = false,
      fullWidth = false,
      label,
      error = false,
      helperText,
      required = false,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [files, setFiles] = useState<UploadFile[]>(initialFiles);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const { showLoading, hideLoading } = useLoading();
    const { showError, showSuccess } = useToastHelpers();

    // 파일 타입 아이콘 가져오기
    const getFileIcon = (file: File) => {
      const type = file.type.toLowerCase();
      if (type.startsWith('image/')) return <ImageIcon />;
      if (type === 'application/pdf') return <PdfIcon />;
      if (type.includes('document') || type.includes('text')) return <DocumentIcon />;
      return <FileIcon />;
    };

    // 상태 아이콘 가져오기
    const getStatusIcon = (status: FileUploadStatus) => {
      switch (status) {
        case 'success':
          return <CheckCircleIcon color="success" />;
        case 'error':
          return <ErrorIcon color="error" />;
        case 'cancelled':
          return <CancelIcon color="disabled" />;
        default:
          return null;
      }
    };

    // 파일 크기 포맷팅
    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 파일 유효성 검사
    const validateFile = (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `파일 크기가 ${formatFileSize(maxSize)}를 초과합니다.`;
      }

      if (allowedFileTypes.length > 0) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
          return `허용된 파일 형식: ${allowedFileTypes.join(', ')}`;
        }
      }

      if (accept !== '*/*') {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const isAccepted = acceptedTypes.some(acceptedType => {
          if (acceptedType.startsWith('.')) {
            return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
          }
          return file.type.match(acceptedType.replace('*', '.*'));
        });
        if (!isAccepted) {
          return `허용되지 않는 파일 형식입니다.`;
        }
      }

      return null;
    };

    // 파일 업로드
    const uploadFile = async (uploadFile: UploadFile) => {
      try {
        // 상태 업데이트
        updateFileStatus(uploadFile.id, 'uploading', 0);

        // 진행률 콜백
        const onProgress = (progress: number) => {
          updateFileStatus(uploadFile.id, 'uploading', progress);
        };

        // 서버 업로드
        const response = await api.uploadFile(uploadFile.file, onProgress);

        // 성공 처리
        const updatedFile: UploadFile = {
          ...uploadFile,
          status: 'success',
          progress: 100,
          url: response.url,
          serverId: response.id,
        };

        updateFile(uploadFile.id, updatedFile);

        if (onUploadSuccess) {
          onUploadSuccess(updatedFile, response);
        }

        showSuccess(`${uploadFile.file.name} 업로드 완료`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.';

        const updatedFile: UploadFile = {
          ...uploadFile,
          status: 'error',
          progress: 0,
          error: errorMessage,
        };

        updateFile(uploadFile.id, updatedFile);

        if (onUploadError) {
          onUploadError(updatedFile, errorMessage);
        }

        showError(`${uploadFile.file.name} 업로드 실패: ${errorMessage}`);
      }
    };

    // 파일 상태 업데이트
    const updateFileStatus = (fileId: string, status: FileUploadStatus, progress?: number) => {
      setFiles(prev => prev.map(file =>
        file.id === fileId
          ? { ...file, status, progress: progress ?? file.progress }
          : file
      ));
    };

    // 파일 업데이트
    const updateFile = (fileId: string, updatedFile: UploadFile) => {
      setFiles(prev => {
        const newFiles = prev.map(file => file.id === fileId ? updatedFile : file);
        if (onFilesChange) {
          onFilesChange(newFiles);
        }
        return newFiles;
      });
    };

    // 파일 선택 처리
    const handleFileSelect = useCallback(
      (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const newFiles = Array.from(selectedFiles);
        let errorMsg = '';

        // 파일 개수 체크
        if (files.length + newFiles.length > maxFiles) {
          errorMsg = `최대 ${maxFiles}개의 파일만 업로드 가능합니다.`;
        } else {
          // 각 파일 유효성 검사
          for (const file of newFiles) {
            const validationError = validateFile(file);
            if (validationError) {
              errorMsg = validationError;
              break;
            }
          }
        }

        if (errorMsg) {
          setErrorMessage(errorMsg);
          showError(errorMsg);
          return;
        }

        setErrorMessage('');

        // 새 파일 객체 생성
        const uploadFiles: UploadFile[] = newFiles.map(file => ({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          status: 'pending' as FileUploadStatus,
          progress: 0,
        }));

        const updatedFiles = multiple ? [...files, ...uploadFiles] : uploadFiles;
        setFiles(updatedFiles);

        if (onFilesChange) {
          onFilesChange(updatedFiles);
        }

        // 자동 업로드
        if (autoUpload) {
          uploadFiles.forEach(uploadFileItem => {
            uploadFile(uploadFileItem);
          });
        }
      },
      [files, maxFiles, multiple, autoUpload, maxSize, accept, allowedFileTypes, onFilesChange]
    );

    // 파일 입력 변경 핸들러
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(event.target.files);
      // 입력 값 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    // 파일 입력 클릭
    const handleInputClick = () => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    // 파일 제거
    const handleFileRemove = async (uploadFile: UploadFile) => {
      try {
        // 서버에서 파일 삭제 (업로드 완료된 경우)
        if (uploadFile.status === 'success' && uploadFile.serverId) {
          await api.deleteFile(uploadFile.serverId);
        }

        // 로컬 상태에서 제거
        const updatedFiles = files.filter(f => f.id !== uploadFile.id);
        setFiles(updatedFiles);

        if (onFilesChange) {
          onFilesChange(updatedFiles);
        }

        if (onFileRemove) {
          onFileRemove(uploadFile);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '파일 삭제 중 오류가 발생했습니다.';
        showError(errorMessage);
      }
    };

    // 수동 업로드
    const handleManualUpload = (uploadFile: UploadFile) => {
      if (uploadFile.status === 'pending' || uploadFile.status === 'error') {
        uploadFile(uploadFile);
      }
    };

    // 업로드 취소
    const handleUploadCancel = (uploadFile: UploadFile) => {
      updateFileStatus(uploadFile.id, 'cancelled');
    };

    // 드래그 이벤트 핸들러
    const handleDragOver = (event: React.DragEvent) => {
      event.preventDefault();
      if (!disabled) {
        setDragOver(true);
      }
    };

    const handleDragLeave = (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
    };

    const handleDrop = (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      if (!disabled) {
        handleFileSelect(event.dataTransfer.files);
      }
    };

    // 파일 미리보기 렌더링
    const renderFilePreview = (uploadFile: UploadFile, index: number) => {
      const { file, status, progress, error } = uploadFile;

      return (
        <ListItem key={uploadFile.id} divider>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            {getFileIcon(file)}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <ListItemText
                primary={file.name}
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                    {error && (
                      <Typography variant="caption" color="error" display="block">
                        {error}
                      </Typography>
                    )}
                  </Box>
                }
              />
              {status === 'uploading' && (
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
            {getStatusIcon(status)}
          </Box>

          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!autoUpload && (status === 'pending' || status === 'error') && (
                <Button
                  size="small"
                  onClick={() => handleManualUpload(uploadFile)}
                  disabled={loading}
                >
                  업로드
                </Button>
              )}
              {status === 'uploading' && (
                <Button
                  size="small"
                  onClick={() => handleUploadCancel(uploadFile)}
                  color="secondary"
                >
                  취소
                </Button>
              )}
              <IconButton
                edge="end"
                onClick={() => handleFileRemove(uploadFile)}
                disabled={loading}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      );
    };

    // 드롭존 렌더링
    const renderDropzone = () => (
      <Paper
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: dragOver ? theme.palette.primary.main : theme.palette.grey[300],
          borderRadius: 2,
          backgroundColor: dragOver ? theme.palette.action.hover : 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.5 : 1,
          ...(fullWidth && { width: '100%' }),
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleInputClick}
      >
        <CloudUploadIcon
          sx={{
            fontSize: 48,
            color: theme.palette.grey[400],
            mb: 2,
          }}
        />
        <Typography variant="h6" gutterBottom>
          {dropzoneText}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {accept !== '*/*' && `허용된 파일 형식: ${accept}`}
          {maxSize && ` • 최대 크기: ${formatFileSize(maxSize)}`}
          {multiple && ` • 최대 ${maxFiles}개`}
        </Typography>
      </Paper>
    );

    // 버튼 렌더링
    const renderButton = () => (
      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onClick={handleInputClick}
        disabled={disabled || loading}
        fullWidth={fullWidth}
      >
        {buttonText}
      </Button>
    );

    return (
      <Box ref={ref} className={className} sx={sx} {...props}>
        {label && (
          <Typography variant="subtitle2" gutterBottom>
            {label}
            {required && <span style={{ color: theme.palette.error.main }}> *</span>}
          </Typography>
        )}

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {/* 파일 선택 UI */}
        {variant === 'dropzone' ? renderDropzone() : renderButton()}

        {/* 에러 메시지 */}
        {(error || errorMessage) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage || helperText}
          </Alert>
        )}

        {/* 도움말 텍스트 */}
        {helperText && !error && !errorMessage && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {helperText}
          </Typography>
        )}

        {/* 파일 목록 */}
        {showFileList && files.length > 0 && (
          <Paper sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            <List>
              {files.map((uploadFile, index) => renderFilePreview(uploadFile, index))}
            </List>
          </Paper>
        )}
      </Box>
    );
  }
);

ServerFileUpload.displayName = 'ServerFileUpload';

export default ServerFileUpload;
