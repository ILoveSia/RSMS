// import type { FileUploadProps } from '@/shared/components/ui/form/types';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import React, { forwardRef, useCallback, useRef, useState } from 'react';
import type { FileUploadProps as FileUploadPropsType } from './types';

// FileUpload 컴포넌트 자체 Props 타입 정의
export interface FileUploadProps extends FileUploadPropsType {}

/**
 * 파일 아이콘 반환
 */
const getFileIcon = (file: File) => {
  const type = file.type.toLowerCase();
  if (type.startsWith('image/')) return <ImageIcon />;
  if (type === 'application/pdf') return <PdfIcon />;
  if (type.includes('document') || type.includes('text')) return <DocumentIcon />;
  return <FileIcon />;
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
  maxSize: number,
  allowedFileTypes: string[]
): string | null => {
  if (file.size > maxSize) {
    return `파일 크기는 ${formatFileSize(maxSize)}를 초과할 수 없습니다.`;
  }

  if (allowedFileTypes.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
      return `허용된 파일 형식: ${allowedFileTypes.join(', ')}`;
    }
  }

  return null;
};

/**
 * FileUpload 컴포넌트
 *
 * 파일 업로드를 위한 컴포넌트
 * 드래그 앤 드롭, 파일 미리보기, 진행률 표시 등을 제공
 *
 * @example
 * ```tsx
 * // 기본 파일 업로드
 * <FileUpload
 *   onFileSelect={handleFileSelect}
 *   accept="image/*"
 *   maxSize={5 * 1024 * 1024} // 5MB
 * />
 *
 * // 드래그 앤 드롭 영역
 * <FileUpload
 *   variant="dropzone"
 *   multiple
 *   maxFiles={5}
 *   onFileSelect={handleFileSelect}
 *   files={selectedFiles}
 *   onFileRemove={handleFileRemove}
 *   preview
 * />
 *
 * // 진행률 표시
 * <FileUpload
 *   onFileSelect={handleFileSelect}
 *   files={selectedFiles}
 *   uploadProgress={[25, 50, 75]}
 *   loading
 * />
 * ```
 */
const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept = '*/*',
      multiple = false,
      maxSize = 10 * 1024 * 1024, // 10MB
      maxFiles = 10,
      onFileSelect,
      onFileRemove,
      files = [],
      preview = false,
      dropzone = false,
      variant = 'button',
      buttonText = '파일 선택',
      dropzoneText = '파일을 드래그하거나 클릭하여 업로드',
      uploadProgress = [],
      loading = false,
      showFileList = true,
      allowedFileTypes = [],
      onError,
      label,
      error = false,
      helperText,
      required = false,
      disabled = false,
      fullWidth = false,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    /**
     * 파일 선택 처리
     */
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
            const validationError = validateFile(file, maxSize, allowedFileTypes);
            if (validationError) {
              errorMsg = validationError;
              break;
            }
          }
        }

        if (errorMsg) {
          if (onError) {
            onError(errorMsg);
          }
          return;
        }

        // 새 파일 추가
        const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
        onFileSelect?.(updatedFiles);
      },
      [files, maxFiles, multiple, maxSize, allowedFileTypes, onFileSelect, onError]
    );

    /**
     * 파일 입력 변경 핸들러
     */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(event.target.files);
      // 입력값 초기화
      if (event.target) {
        event.target.value = '';
      }
    };

    /**
     * 파일 입력 클릭 핸들러
     */
    const handleInputClick = () => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    /**
     * 파일 제거 핸들러
     */
    const handleFileRemove = (index: number) => {
      if (onFileRemove) {
        onFileRemove(index);
      }
    };

    /**
     * 드래그 오버 핸들러
     */
    const handleDragOver = (event: React.DragEvent) => {
      event.preventDefault();
      if (!disabled) {
        setDragOver(true);
      }
    };

    /**
     * 드래그 리브 핸들러
     */
    const handleDragLeave = (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
    };

    /**
     * 드롭 핸들러
     */
    const handleDrop = (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      if (!disabled) {
        handleFileSelect(event.dataTransfer.files);
      }
    };

    /**
     * 파일 미리보기 렌더링
     */
    const renderFilePreview = (file: File, index: number) => {
      const progress = uploadProgress[index] || 0;

      return (
        <ListItem key={index} divider>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            {preview && file.type.startsWith('image/') ? (
              <Box
                component="img"
                src={URL.createObjectURL(file)}
                alt={file.name}
                sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
              />
            ) : (
              getFileIcon(file)
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <ListItemText
                primary={file.name}
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                    {loading && (
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                }
              />
            </Box>
          </Box>
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={() => handleFileRemove(index)}
              disabled={loading}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
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

    /**
     * 버튼 렌더링
     */
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
          style={{ display: 'none' }}
        />

        {/* 파일 선택 UI */}
        {variant === 'dropzone' ? renderDropzone() : renderButton()}

        {/* 에러 메시지 */}
        {error && helperText && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {helperText}
          </Alert>
        )}

        {/* 도움말 텍스트 */}
        {helperText && !error && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {helperText}
          </Typography>
        )}

        {/* 파일 목록 */}
        {showFileList && files.length > 0 && (
          <Paper sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            <List>
              {files.map((file, index) => renderFilePreview(file, index))}
            </List>
          </Paper>
        )}
      </Box>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;
