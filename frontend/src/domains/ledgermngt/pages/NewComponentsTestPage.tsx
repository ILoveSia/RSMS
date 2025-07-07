import type { ServerDataGridApi, ServerRequest } from '@/shared/components/ui/data-display';
import { ServerDataGrid } from '@/shared/components/ui/data-display';
import { useLoading } from '@/shared/components/ui/feedback/LoadingProvider';
import { useToastHelpers } from '@/shared/components/ui/feedback/ToastProvider';
import type { ServerFileUploadApi, UploadFile, UploadResponse } from '@/shared/components/ui/form';
import { ServerFileUpload } from '@/shared/components/ui/form';
import type { DataGridColumn } from '@/shared/types/common';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

// 테스트 데이터 타입
interface TestData {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  joinDate: string;
  status: string;
}

// 테스트 데이터 생성
const generateTestData = (count: number): TestData[] => {
  const departments = ['개발팀', '디자인팀', '마케팅팀', '영업팀', '인사팀'];
  const positions = ['팀장', '선임', '주임', '사원', '인턴'];
  const statuses = ['재직', '휴직', '퇴사'];

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `사용자${index + 1}`,
    email: `user${index + 1}@company.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    position: positions[Math.floor(Math.random() * positions.length)],
    joinDate: new Date(
      2020 + Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toISOString()
      .split('T')[0],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

const NewComponentsTestPage: React.FC = () => {
  const [testData] = useState<TestData[]>(() => generateTestData(50));
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

  const { showSuccess, showError, showInfo, showWarning } = useToastHelpers();
  const { showLoading, hideLoading } = useLoading();

  // ServerDataGrid API 구현
  const dataGridApi: ServerDataGridApi<TestData> = {
    fetchData: async (request: ServerRequest) => {
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredData = [...testData];

      // 검색 필터링
      if (request.search) {
        const searchTerm = request.search.toLowerCase();
        filteredData = filteredData.filter(
          item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.email.toLowerCase().includes(searchTerm) ||
            item.department.toLowerCase().includes(searchTerm)
        );
      }

      // 정렬
      if (request.sort && request.sort.length > 0) {
        const [field, direction] = request.sort[0].split(',');
        filteredData.sort((a, b) => {
          const aValue = a[field as keyof TestData];
          const bValue = b[field as keyof TestData];
          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return direction === 'desc' ? -comparison : comparison;
        });
      }

      // 페이지네이션
      const startIndex = request.page * request.size;
      const endIndex = startIndex + request.size;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return {
        content: paginatedData,
        totalElements: filteredData.length,
        totalPages: Math.ceil(filteredData.length / request.size),
        size: request.size,
        number: request.page,
        first: request.page === 0,
        last: request.page === Math.ceil(filteredData.length / request.size) - 1,
        numberOfElements: paginatedData.length,
        empty: paginatedData.length === 0,
      };
    },
    exportData: async (request: ServerRequest) => {
      const response = await dataGridApi.fetchData(request);
      const csvContent = [
        ['ID', '이름', '이메일', '부서', '직급', '입사일', '상태'].join(','),
        ...response.content.map(item =>
          [
            item.id,
            item.name,
            item.email,
            item.department,
            item.position,
            item.joinDate,
            item.status,
          ].join(',')
        ),
      ].join('\n');

      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    },
    deleteRows: async (ids: (string | number)[]) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      showSuccess(`${ids.length}개 항목이 삭제되었습니다.`);
    },
  };

  // ServerFileUpload API 구현
  const fileUploadApi: ServerFileUploadApi = {
    uploadFile: async (file: File, onProgress?: (progress: number) => void) => {
      // 업로드 시뮬레이션
      return new Promise<UploadResponse>((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            resolve({
              id: Date.now(),
              filename: `uploaded_${file.name}`,
              originalName: file.name,
              size: file.size,
              mimeType: file.type,
              url: URL.createObjectURL(file),
            });
          }
          onProgress?.(progress);
        }, 200);

        // 10% 확률로 실패 시뮬레이션
        if (Math.random() < 0.1) {
          setTimeout(() => {
            clearInterval(interval);
            reject(new Error('업로드 실패 시뮬레이션'));
          }, 2000);
        }
      });
    },
    deleteFile: async (fileId: string | number) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      showSuccess('파일이 삭제되었습니다.');
    },
    getFileUrl: (fileId: string | number) => {
      return `https://example.com/files/${fileId}`;
    },
  };

  // 컬럼 정의
  const columns: DataGridColumn<TestData>[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: '이름', width: 120 },
    { field: 'email', headerName: '이메일', width: 200, flex: 1 },
    { field: 'department', headerName: '부서', width: 120 },
    { field: 'position', headerName: '직급', width: 100 },
    { field: 'joinDate', headerName: '입사일', width: 120 },
    {
      field: 'status',
      headerName: '상태',
      width: 100,
      renderCell: ({ value }) => (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            backgroundColor:
              value === '재직' ? '#e8f5e8' : value === '휴직' ? '#fff3cd' : '#f8d7da',
            color: value === '재직' ? '#2e7d32' : value === '휴직' ? '#856404' : '#721c24',
          }}
        >
          {value}
        </Box>
      ),
    },
  ];

  // Toast 테스트 함수들
  const handleToastTest = (type: 'success' | 'error' | 'info' | 'warning') => {
    const messages = {
      success: '성공적으로 처리되었습니다!',
      error: '오류가 발생했습니다.',
      info: '정보를 확인해주세요.',
      warning: '주의가 필요합니다.',
    };

    switch (type) {
      case 'success':
        showSuccess(messages.success);
        break;
      case 'error':
        showError(messages.error);
        break;
      case 'info':
        showInfo(messages.info);
        break;
      case 'warning':
        showWarning(messages.warning);
        break;
    }
  };

  // Loading 테스트 함수들
  const handleLoadingTest = async (duration: number = 3000) => {
    const loadingId = showLoading('데이터를 처리하는 중...');
    setTimeout(() => {
      hideLoading(loadingId);
      showSuccess('처리가 완료되었습니다!');
    }, duration);
  };

  const handleProgressLoadingTest = async () => {
    const loadingId = showLoading('진행률 테스트 중...', 0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        hideLoading(loadingId);
        showSuccess('진행률 테스트 완료!');
      } else {
        // 진행률 업데이트는 LoadingProvider에서 지원하는 경우에만 작동
        showLoading(`진행률 테스트 중... ${progress}%`, progress);
      }
    }, 300);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        새로운 컴포넌트 테스트 페이지
      </Typography>
      <Typography variant='body1' color='text.secondary' paragraph>
        개선된 4가지 컴포넌트를 테스트할 수 있는 통합 페이지입니다.
      </Typography>

      <Grid container spacing={3}>
        {/* Toast 시스템 테스트 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                1. 글로벌 Toast 시스템
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                여러 Toast 메시지를 동시에 표시하고 관리할 수 있습니다.
              </Typography>
              <Stack direction='row' spacing={1} flexWrap='wrap' gap={1}>
                <Button
                  variant='contained'
                  color='success'
                  onClick={() => handleToastTest('success')}
                >
                  성공 Toast
                </Button>
                <Button variant='contained' color='error' onClick={() => handleToastTest('error')}>
                  오류 Toast
                </Button>
                <Button variant='contained' color='info' onClick={() => handleToastTest('info')}>
                  정보 Toast
                </Button>
                <Button
                  variant='contained'
                  color='warning'
                  onClick={() => handleToastTest('warning')}
                >
                  경고 Toast
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Loading 시스템 테스트 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                2. 글로벌 Loading 시스템
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                전역 로딩 상태를 관리하고 진행률을 표시할 수 있습니다.
              </Typography>
              <Stack direction='row' spacing={1} flexWrap='wrap' gap={1}>
                <Button variant='contained' onClick={() => handleLoadingTest(2000)}>
                  2초 로딩
                </Button>
                <Button variant='contained' onClick={() => handleLoadingTest(5000)}>
                  5초 로딩
                </Button>
                <Button variant='contained' color='secondary' onClick={handleProgressLoadingTest}>
                  진행률 테스트
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ServerDataGrid 테스트 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                3. ServerDataGrid 서버 사이드 연동
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                서버 사이드 페이지네이션, 정렬, 필터링, 검색, 내보내기 기능을 지원합니다.
              </Typography>
              <Box sx={{ height: 600, mt: 2 }}>
                <ServerDataGrid
                  api={dataGridApi}
                  columns={columns}
                  initialPageSize={10}
                  pageSizeOptions={[5, 10, 25, 50]}
                  searchable
                  searchPlaceholder='이름, 이메일, 부서로 검색...'
                  exportable
                  deletable
                  selectable
                  multiSelect
                  refreshable
                  height={600}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ServerFileUpload 테스트 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                4. ServerFileUpload 실제 서버 연동
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                실제 서버 업로드, 진행률 표시, 에러 처리 등을 지원합니다.
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    버튼 방식
                  </Typography>
                  <ServerFileUpload
                    api={fileUploadApi}
                    variant='button'
                    multiple
                    maxSize={5 * 1024 * 1024} // 5MB
                    accept='image/*,application/pdf,.doc,.docx'
                    onFilesChange={setUploadedFiles}
                    onUploadSuccess={(file, response) => {
                      showSuccess(`${file.file.name} 업로드 완료!`);
                    }}
                    onUploadError={(file, error) => {
                      showError(`${file.file.name} 업로드 실패: ${error}`);
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' gutterBottom>
                    드래그 앤 드롭 방식
                  </Typography>
                  <ServerFileUpload
                    api={fileUploadApi}
                    variant='dropzone'
                    multiple
                    maxSize={10 * 1024 * 1024} // 10MB
                    maxFiles={5}
                    dropzoneText='파일을 여기에 드래그하거나 클릭하여 업로드'
                    autoUpload={false}
                    onFilesChange={setUploadedFiles}
                    onUploadSuccess={(file, response) => {
                      showSuccess(`${file.file.name} 업로드 완료!`);
                    }}
                    onUploadError={(file, error) => {
                      showError(`${file.file.name} 업로드 실패: ${error}`);
                    }}
                  />
                </Grid>
              </Grid>

              {uploadedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant='subtitle2' gutterBottom>
                    업로드된 파일 정보
                  </Typography>
                  <Alert severity='info'>
                    총 {uploadedFiles.length}개의 파일이 업로드되었습니다.
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NewComponentsTestPage;
