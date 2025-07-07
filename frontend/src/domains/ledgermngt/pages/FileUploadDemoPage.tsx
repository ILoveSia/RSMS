import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { ServerFileUpload } from '@/shared/components/ui/form';
import type { ServerFileUploadApi, UploadFile, UploadResponse } from '@/shared/components/ui/form';
import { useToastHelpers } from '@/shared/components/ui/feedback/ToastProvider';

const FileUploadDemoPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [uploadHistory, setUploadHistory] = useState<{
    success: UploadResponse[];
    errors: { fileName: string; error: string }[];
  }>({
    success: [],
    errors: []
  });

  const { showSuccess, showError, showInfo } = useToastHelpers();

  // ServerFileUpload API 구현
  const fileUploadApi: ServerFileUploadApi = {
    uploadFile: async (file: File, onProgress?: (progress: number) => void) => {
      return new Promise<UploadResponse>((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20 + 5; // 5-25% 증가
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            const response: UploadResponse = {
              id: Date.now() + Math.random(),
              filename: `uploaded_${Date.now()}_${file.name}`,
              originalName: file.name,
              size: file.size,
              mimeType: file.type,
              url: URL.createObjectURL(file),
              path: `/uploads/${file.name}`
            };

            // 성공 기록 추가
            setUploadHistory(prev => ({
              ...prev,
              success: [...prev.success, response]
            }));

            resolve(response);
          }
          onProgress?.(progress);
        }, 100 + Math.random() * 200); // 100-300ms 간격

        // 15% 확률로 실패 시뮬레이션
        if (Math.random() < 0.15) {
          setTimeout(() => {
            clearInterval(interval);
            const errorMsg = '네트워크 오류로 업로드에 실패했습니다.';
            
            // 에러 기록 추가
            setUploadHistory(prev => ({
              ...prev,
              errors: [...prev.errors, { fileName: file.name, error: errorMsg }]
            }));

            reject(new Error(errorMsg));
          }, 1000 + Math.random() * 2000);
        }
      });
    },
    deleteFile: async (fileId: string | number) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 성공 기록에서 제거
      setUploadHistory(prev => ({
        ...prev,
        success: prev.success.filter(item => item.id !== fileId)
      }));
      
      showSuccess('파일이 서버에서 삭제되었습니다.');
    },
    getFileUrl: (fileId: string | number) => {
      const file = uploadHistory.success.find(item => item.id === fileId);
      return file?.url || `https://example.com/files/${fileId}`;
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

  // 통계 초기화
  const handleClearHistory = () => {
    setUploadHistory({ success: [], errors: [] });
    setUploadedFiles([]);
    showInfo('업로드 기록이 초기화되었습니다.');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        파일 업로드 데모 페이지
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        ServerFileUpload 컴포넌트의 다양한 기능을 테스트할 수 있습니다.
      </Typography>

      <Grid container spacing={3}>
        {/* 업로드 통계 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                업로드 통계
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  icon={<SuccessIcon />}
                  label={`성공: ${uploadHistory.success.length}개`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<ErrorIcon />}
                  label={`실패: ${uploadHistory.errors.length}개`}
                  color="error"
                  variant="outlined"
                />
                <Chip
                  icon={<CloudUploadIcon />}
                  label={`현재 업로드 중: ${uploadedFiles.filter(f => f.status === 'uploading').length}개`}
                  color="info"
                  variant="outlined"
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearHistory}
                >
                  기록 초기화
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 기본 업로드 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                기본 파일 업로드
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                버튼 방식의 기본 파일 업로드입니다.
              </Typography>
              <ServerFileUpload
                api={fileUploadApi}
                variant="button"
                buttonText="파일 선택"
                multiple
                maxSize={5 * 1024 * 1024} // 5MB
                maxFiles={3}
                accept="image/*,application/pdf,.doc,.docx,.txt"
                onFilesChange={setUploadedFiles}
                onUploadSuccess={(file, response) => {
                  showSuccess(`${file.file.name} 업로드 완료!`);
                }}
                onUploadError={(file, error) => {
                  showError(`${file.file.name} 업로드 실패: ${error}`);
                }}
                helperText="최대 5MB, 3개 파일까지 업로드 가능"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 드래그 앤 드롭 업로드 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                드래그 앤 드롭 업로드
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                파일을 드래그하여 업로드할 수 있습니다.
              </Typography>
              <ServerFileUpload
                api={fileUploadApi}
                variant="dropzone"
                dropzoneText="파일을 여기에 드래그하거나 클릭하여 업로드"
                multiple
                maxSize={10 * 1024 * 1024} // 10MB
                maxFiles={5}
                accept="image/*,application/pdf"
                autoUpload={false}
                onFilesChange={setUploadedFiles}
                onUploadSuccess={(file, response) => {
                  showSuccess(`${file.file.name} 업로드 완료!`);
                }}
                onUploadError={(file, error) => {
                  showError(`${file.file.name} 업로드 실패: ${error}`);
                }}
                helperText="이미지 또는 PDF 파일만 업로드 가능 (최대 10MB, 5개)"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 업로드 성공 기록 */}
        {uploadHistory.success.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  업로드 성공 기록
                </Typography>
                <List dense>
                  {uploadHistory.success.slice(-5).map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <SuccessIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.originalName}
                        secondary={`${formatFileSize(file.size)} • ${file.mimeType}`}
                      />
                    </ListItem>
                  ))}
                </List>
                {uploadHistory.success.length > 5 && (
                  <Typography variant="caption" color="text.secondary">
                    최근 5개 항목만 표시 (총 {uploadHistory.success.length}개)
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 업로드 실패 기록 */}
        {uploadHistory.errors.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error.main">
                  업로드 실패 기록
                </Typography>
                <List dense>
                  {uploadHistory.errors.slice(-5).map((error, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={error.fileName}
                        secondary={error.error}
                      />
                    </ListItem>
                  ))}
                </List>
                {uploadHistory.errors.length > 5 && (
                  <Typography variant="caption" color="text.secondary">
                    최근 5개 항목만 표시 (총 {uploadHistory.errors.length}개)
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 사용법 안내 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                사용법 안내
              </Typography>
              <Stack spacing={2}>
                <Alert severity="info">
                  <strong>자동 업로드 vs 수동 업로드:</strong><br/>
                  - 자동 업로드: 파일 선택 즉시 업로드 시작<br/>
                  - 수동 업로드: 파일 선택 후 업로드 버튼 클릭 시 업로드
                </Alert>
                <Alert severity="success">
                  <strong>업로드 성공 시:</strong><br/>
                  - 진행률 100% 표시<br/>
                  - 성공 아이콘 표시<br/>
                  - Toast 메시지 표시<br/>
                  - 파일 목록에 업로드된 파일 정보 표시
                </Alert>
                <Alert severity="error">
                  <strong>업로드 실패 시:</strong><br/>
                  - 에러 아이콘 표시<br/>
                  - 에러 메시지 표시<br/>
                  - Toast 오류 메시지 표시<br/>
                  - 재시도 버튼 제공
                </Alert>
                <Alert severity="warning">
                  <strong>주의사항:</strong><br/>
                  - 파일 크기 제한 확인<br/>
                  - 허용된 파일 형식 확인<br/>
                  - 최대 파일 개수 제한 확인<br/>
                  - 네트워크 상태에 따라 업로드 시간 변동 가능
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FileUploadDemoPage;