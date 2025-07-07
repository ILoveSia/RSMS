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
import { FileUploadProps } from './types';

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
    const [errorMessage, setErrorMessage] = useState<string>('');

    // 파일 타입 아이콘 가져오기
    const getFileIcon = (file: File) => {
      const type = file.type.toLowerCase();
      if (type.startsWith('image/')) return <ImageIcon />;
      if (type === 'application/pdf') return <PdfIcon />;
      if (type.includes('document') || type.includes('text')) return <DocumentIcon />;
      return <FileIcon />;
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

    // 파일 선택 처리
    const handleFileSelect = useCallback(
      (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const newFiles = Array.from(selectedFiles);
        const validFiles: File[] = [];
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
            validFiles.push(file);
          }
        }

        if (errorMsg) {
          setErrorMessage(errorMsg);
          if (onError) onError(errorMsg);
          return;
        }

        setErrorMessage('');
        onFileSelect(multiple ? [...files, ...validFiles] : validFiles);
      },
      [files, maxFiles, multiple, onFileSelect, onError, maxSize, accept, allowedFileTypes]
    );

    // 파일 입력 변경 핸들러
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(event.target.files);
      // 입력 값 초기화 (같은 파일 재선택 가능)
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
    const handleFileRemove = (index: number) => {
      if (onFileRemove) {
        onFileRemove(index);
      }
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
    const renderFilePreview = (file: File, index: number) => {
      const isImage = file.type.startsWith('image/');
      const progress = uploadProgress[index];

      return (
        <ListItem key={index} divider>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {preview && isImage ? (
              <Box
                component='img'
                src={URL.createObjectURL(file)}
                alt={file.name}
                sx={{
                  width: 48,
                  height: 48,
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            ) : (
              getFileIcon(file)
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ListItemText
                primary={file.name}
                secondary={formatFileSize(file.size)}
                primaryTypographyProps={{
                  noWrap: true,
                  title: file.name,
                }}
              />
              {progress !== undefined && (
                <LinearProgress variant='determinate' value={progress} sx={{ mt: 1 }} />
              )}
            </Box>
          </Box>
          <ListItemSecondaryAction>
            <IconButton
              edge='end'
              onClick={() => handleFileRemove(index)}
              disabled={disabled || loading}
              size='small'
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    };

    // 드롭존 렌더링
    const renderDropzone = () => (
      <Paper
        ref={ref}
        variant='outlined'
        className={className}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: disabled ? 'default' : 'pointer',
          border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.divider}`,
          backgroundColor: dragOver ? theme.palette.action.hover : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': !disabled && {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.action.hover,
          },
          ...sx,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleInputClick}
        {...props}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant='h6' gutterBottom>
          {dropzoneText}
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          {accept !== '*/*' && `허용된 형식: ${accept}`}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          최대 파일 크기: {formatFileSize(maxSize)}
        </Typography>
        {maxFiles > 1 && (
          <Typography variant='body2' color='text.secondary'>
            최대 {maxFiles}개 파일
          </Typography>
        )}
      </Paper>
    );

    // 버튼 렌더링
    const renderButton = () => (
      <Button
        ref={ref}
        variant='outlined'
        startIcon={<CloudUploadIcon />}
        onClick={handleInputClick}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        className={className}
        sx={sx}
        {...props}
      >
        {buttonText}
      </Button>
    );

    return (
      <Box>
        {/* 라벨 */}
        {label && (
          <Typography
            variant='body2'
            component='label'
            sx={{
              display: 'block',
              mb: 1,
              color: error ? 'error.main' : 'text.primary',
              fontWeight: 500,
            }}
          >
            {label}
            {required && <span style={{ color: theme.palette.error.main }}> *</span>}
          </Typography>
        )}

        {/* 파일 입력 */}
        <input
          ref={fileInputRef}
          type='file'
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {/* 업로드 영역 */}
        {variant === 'dropzone' || dropzone ? renderDropzone() : renderButton()}

        {/* 에러 메시지 */}
        {(error || errorMessage) && (
          <Alert severity='error' sx={{ mt: 1 }}>
            {errorMessage || helperText}
          </Alert>
        )}

        {/* 도움말 텍스트 */}
        {helperText && !error && !errorMessage && (
          <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
            {helperText}
          </Typography>
        )}

        {/* 파일 목록 */}
        {showFileList && files.length > 0 && (
          <Paper variant='outlined' sx={{ mt: 2 }}>
            <List dense>{files.map((file, index) => renderFilePreview(file, index))}</List>
          </Paper>
        )}

        {/* 파일 정보 칩 */}
        {files.length > 0 && !showFileList && (
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {files.map((file, index) => (
              <Chip
                key={index}
                label={`${file.name} (${formatFileSize(file.size)})`}
                onDelete={() => handleFileRemove(index)}
                size='small'
                variant='outlined'
              />
            ))}
          </Box>
        )}
      </Box>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;
