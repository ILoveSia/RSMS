import type { BaseComponentProps } from '@/shared/types/common';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  Error as ErrorIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
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
  Typography
} from '@mui/material';
import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { useToastHelpers } from '../feedback/ToastProvider';

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
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

/**
 * 파일 아이콘 반환
 */
    const getFileIcon = (file: File) => {
      const type = file.type.toLowerCase();
  if (type.includes('image/')) return <ImageIcon />;
  if (type.includes('pdf')) return <PdfIcon />;
  if (type.includes('document') || type.includes('word')) return <DocumentIcon />;
      return <FileIcon />;
    };

/**
 * 상태 아이콘 반환
 */
    const getStatusIcon = (status: FileUploadStatus) => {
      switch (status) {
        case 'success':
          return <CheckCircleIcon color="success" />;
        case 'error':
          return <ErrorIcon color="error" />;
    case 'uploading':
      return <LinearProgress variant="determinate" value={0} />;
        case 'cancelled':
          return <CancelIcon color="disabled" />;
        default:
          return null;
      }
    };

/**
 * 파일 크기 포맷팅
 */
    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

/**
 * 파일 검증
 */
const validateFile = (
  file: File,
  maxSize?: number,
  allowedFileTypes?: string[]
): string | null => {
      if (maxSize && file.size > maxSize) {
    return `파일 크기는 ${formatFileSize(maxSize)}를 초과할 수 없습니다.`;
      }

  if (allowedFileTypes && allowedFileTypes.length > 0) {
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedFileTypes.includes(fileExtension)) {
      return `허용되지 않는 파일 형식입니다. 허용된 형식: ${allowedFileTypes.join(', ')}`;
        }
      }

      return null;
    };

/**
 * ServerFileUpload 컴포넌트
 */
const ServerFileUpload = forwardRef<HTMLInputElement, ServerFileUploadProps>(({
  api,
  accept = '*/*',
  multiple = false,
  maxSize,
  maxFiles,
  allowedFileTypes,
  initialFiles = [],
  onFilesChange,
  onUploadSuccess,
  onUploadError,
  onFileRemove,
  variant = 'button',
  buttonText = '파일 선택',
  dropzoneText = '파일을 드래그하여 업로드하거나 클릭하여 선택하세요',
  preview = true,
  showFileList = true,
  autoUpload = true,
  disabled = false,
  loading = false,
  fullWidth = false,
  error = false,
  helperText,
  required = false,
  className,
  style,
  id,
  'data-testid': dataTestId,
  sx,
}, ref) => {
  const { showSuccess, showError } = useToastHelpers();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFile[]>(initialFiles);
  const [dragActive, setDragActive] = useState(false);

  /**
   * 파일 업로드 처리
   */
    const uploadFile = async (uploadFile: UploadFile) => {
      try {
        updateFileStatus(uploadFile.id, 'uploading', 0);

        const onProgress = (progress: number) => {
          updateFileStatus(uploadFile.id, 'uploading', progress);
        };

        const response = await api.uploadFile(uploadFile.file, onProgress);

        const updatedFile: UploadFile = {
          ...uploadFile,
          status: 'success',
          progress: 100,
          url: response.url,
          serverId: response.id,
        };

        updateFile(uploadFile.id, updatedFile);
      onUploadSuccess?.(updatedFile, response);
      showSuccess('파일이 성공적으로 업로드되었습니다.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.';
        const updatedFile: UploadFile = {
          ...uploadFile,
          status: 'error',
          error: errorMessage,
        };

        updateFile(uploadFile.id, updatedFile);
      onUploadError?.(updatedFile, errorMessage);
      showError(errorMessage);
      }
    };

  /**
   * 파일 상태 업데이트
   */
    const updateFileStatus = (fileId: string, status: FileUploadStatus, progress?: number) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId
          ? { ...file, status, progress: progress ?? file.progress }
          : file
      )
    );
    };

  /**
   * 파일 업데이트
   */
    const updateFile = (fileId: string, updatedFile: UploadFile) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId ? updatedFile : file
      )
    );
    onFilesChange?.(files);
    };

  /**
   * 파일 추가
   */
  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: UploadFile[] = [];

          for (const file of newFiles) {
      const validationError = validateFile(file, maxSize, allowedFileTypes);
            if (validationError) {
        showError(validationError);
        continue;
        }

      if (maxFiles && files.length + validFiles.length >= maxFiles) {
        showError(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        break;
        }

      const uploadFile: UploadFile = {
        id: `${Date.now()}-${Math.random()}`,
          file,
        status: 'pending',
          progress: 0,
      };

      validFiles.push(uploadFile);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);

        if (autoUpload) {
        validFiles.forEach(file => {
          if (file.status === 'pending') {
            uploadFile(file);
          }
          });
      }
        }
  }, [files, maxSize, allowedFileTypes, maxFiles, autoUpload, onFilesChange, showError, uploadFile]);

  /**
   * 파일 입력 변경 핸들러
   */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // 입력값 초기화
    if (event.target) {
      event.target.value = '';
      }
    };

  /**
   * 파일 입력 클릭 핸들러
   */
    const handleInputClick = () => {
    fileInputRef.current?.click();
    };

  /**
   * 파일 제거 핸들러
   */
    const handleFileRemove = async (uploadFile: UploadFile) => {
      try {
      if (uploadFile.serverId) {
          await api.deleteFile(uploadFile.serverId);
        }

      const updatedFiles = files.filter(file => file.id !== uploadFile.id);
        setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
      onFileRemove?.(uploadFile);
      showSuccess('파일이 제거되었습니다.');
    } catch (error) {
      showError('파일 제거 중 오류가 발생했습니다.');
      }
    };

  /**
   * 수동 업로드 핸들러
   */
  const handleManualUpload = (fileToUpload: UploadFile) => {
    uploadFile(fileToUpload);
    };

  /**
   * 업로드 취소 핸들러
   */
    const handleUploadCancel = (uploadFile: UploadFile) => {
      updateFileStatus(uploadFile.id, 'cancelled');
    };

  /**
   * 드래그 오버 핸들러
   */
    const handleDragOver = (event: React.DragEvent) => {
      event.preventDefault();
    setDragActive(true);
    };

  /**
   * 드래그 리브 핸들러
   */
    const handleDragLeave = (event: React.DragEvent) => {
      event.preventDefault();
    setDragActive(false);
    };

  /**
   * 드롭 핸들러
   */
    const handleDrop = (event: React.DragEvent) => {
      event.preventDefault();
    setDragActive(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
      }
    };

  /**
   * 파일 미리보기 렌더링
   */
    const renderFilePreview = (uploadFile: UploadFile, index: number) => {
      const { file, status, progress, error } = uploadFile;

      return (
      <ListItem key={uploadFile.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {preview && file.type.startsWith('image/') ? (
            <Box
              component="img"
              src={URL.createObjectURL(file)}
              alt={file.name}
              sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, mr: 2 }}
            />
          ) : (
            <Box sx={{ mr: 2 }}>{getFileIcon(file)}</Box>
          )}
          
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
                {status === 'uploading' && (
                  <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
                )}
                  </Box>
                }
              />
          </Box>

          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', gap: 1 }}>
            {getStatusIcon(status)}
            {status === 'pending' && (
              <IconButton size="small" onClick={() => handleManualUpload(uploadFile)}>
                <CloudUploadIcon />
              </IconButton>
              )}
              {status === 'uploading' && (
              <IconButton size="small" onClick={() => handleUploadCancel(uploadFile)}>
                <CancelIcon />
              </IconButton>
              )}
            <IconButton size="small" onClick={() => handleFileRemove(uploadFile)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      );
    };

  /**
   * 드롭존 렌더링
   */
    const renderDropzone = () => (
      <Paper
        sx={{
          border: '2px dashed',
        borderColor: dragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
        p: 3,
          textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: dragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover',
        },
        }}
      onClick={handleInputClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
      <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
          {dropzoneText}
        </Typography>
        <Typography variant="body2" color="text.secondary">
        또는 클릭하여 파일을 선택하세요
        </Typography>
      </Paper>
    );

  /**
   * 버튼 렌더링
   */
    const renderButton = () => (
      <Button
      variant="outlined"
      component="label"
        startIcon={<CloudUploadIcon />}
        disabled={disabled || loading}
        fullWidth={fullWidth}
      sx={{ ...sx }}
      >
        {buttonText}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
    </Button>
  );

  return (
    <Box
      className={className}
      style={style}
      id={id}
      data-testid={dataTestId}
      sx={{ width: fullWidth ? '100%' : 'auto' }}
    >
        {variant === 'dropzone' ? renderDropzone() : renderButton()}

      {showFileList && files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, index) => renderFilePreview(file, index))}
        </List>
      )}
      
      {error && helperText && (
        <Alert severity="error" sx={{ mt: 1 }}>
            {helperText}
        </Alert>
        )}
      </Box>
    );
});

ServerFileUpload.displayName = 'ServerFileUpload';

export default ServerFileUpload;
