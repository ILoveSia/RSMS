/**
 * 책무 등록/수정/조회 다이얼로그 컴포넌트
 */
import apiClient from '@/app/common/api/client';
import { Dialog } from '@/shared/components/modal';
import { Button } from '@/shared/components/ui';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

// 백엔드 ApiResponse<T> DTO에 대응하는 타입
interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// 책무 데이터 타입
export interface ResponsibilityData {
  responsibilityId?: string;
  responsibilityContent: string;
  details: ResponsibilityDetail[];
}

// 책무 상세 데이터 타입
export interface ResponsibilityDetail {
  id?: string; // 프론트엔드에서 사용하는 임시 ID
  responsibilityDetailId?: string; // 백엔드 ID
  responsibilityDetailContent: string;
  keyManagementTasks: string;
  relatedBasis: string;
}

export interface ResponsibilityDialogProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  responsibilityId?: number | null;
  onClose: () => void;
  onSave?: (data: ResponsibilityData) => void;
  onChangeMode?: (newMode: 'create' | 'edit' | 'view') => void;
}

const ResponsibilityDialog: React.FC<ResponsibilityDialogProps> = ({
  open,
  mode,
  responsibilityId,
  onClose,
  onSave,
  onChangeMode,
}) => {
  const [responsibilityContent, setResponsibilityContent] = useState('');
  const [details, setDetails] = useState<ResponsibilityDetail[]>([
    {
      id: `temp-${Date.now()}`,
      responsibilityDetailContent: '',
      keyManagementTasks: '',
      relatedBasis: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const getDialogTitle = () => {
    switch (mode) {
      case 'create':
        return '책무 등록';
      case 'edit':
        return '책무 수정';
      case 'view':
        return '책무 상세조회';
      default:
        return '책무';
    }
  };

  // 데이터 초기화 및 로드
  useEffect(() => {
    console.log(
      '[ResponsibilityDialog useEffect] open:',
      open,
      'mode:',
      mode,
      'responsibilityId:',
      responsibilityId
    );
    const fetchDetails = async (id: string) => {
      console.log('[ResponsibilityDialog] fetchDetails 시작 - id:', id);
      setLoading(true);
      setError(null);
      try {
        // 응답 데이터의 상세 타입 정의
        type DetailResponseType = {
          id: number;
          responsibilityDetailContent: string;
          keyManagementTasks: string;
          relatedBasis: string;
        };
        // 전체 응답 데이터 타입 정의
        type ResponseType = {
          id: number;
          responsibilityContent: string;
          details: DetailResponseType[];
        };

        console.log('[ResponsibilityDialog] API 호출 시작 - URL:', `/api/responsibilities/${id}`);
        const response = await apiClient.get<ApiSuccessResponse<ResponseType> | ResponseType>(`/api/responsibilities/${id}`);

        console.log('[ResponsibilityDialog] API 응답:', response);

        // ApiResponse 래퍼 구조인지 확인하여 적절히 처리
        let fetchedData: ResponseType;
        if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
          // ApiResponse 래퍼 구조인 경우
          const apiResponse = response as ApiSuccessResponse<ResponseType>;
          if (apiResponse.success && apiResponse.data) {
            fetchedData = apiResponse.data;
            console.log('[ResponsibilityDialog] ApiResponse 래퍼에서 데이터 추출:', fetchedData);
          } else {
            throw new Error(apiResponse.message || '데이터를 불러오는 데 실패했습니다.');
          }
        } else if (response) {
          // 이미 unwrap된 데이터인 경우
          fetchedData = response as ResponseType;
          console.log('[ResponsibilityDialog] 직접 데이터 사용:', fetchedData);
        } else {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }

        setResponsibilityContent(fetchedData.responsibilityContent);
        setDetails(
          fetchedData.details.map((d: DetailResponseType) => ({
            id: String(d.id),
            responsibilityDetailId: String(d.id),
            responsibilityDetailContent: d.responsibilityDetailContent,
            keyManagementTasks: d.keyManagementTasks,
            relatedBasis: d.relatedBasis,
          }))
        );
        console.log('[ResponsibilityDialog] 데이터 설정 완료');
      } catch (err) {
        const error = err as Error;
        setError(error.message || '상세 정보를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if ((mode === 'edit' || mode === 'view') && responsibilityId != null && open) {
      console.log('[ResponsibilityDialog useEffect] fetchDetails 호출 조건 만족:', {
        mode,
        responsibilityId,
        open,
      });
      fetchDetails(responsibilityId.toString());
    } else {
      console.log('[ResponsibilityDialog useEffect] fetchDetails 호출 조건 불만족:', {
        mode,
        responsibilityId,
        open,
      });
    }

    if (open) {
      setResponsibilityContent('');
      setDetails([
        {
          id: `temp-${Date.now()}`,
          responsibilityDetailContent: '',
          keyManagementTasks: '',
          relatedBasis: '',
        },
      ]);
    }
  }, [open, mode, responsibilityId]);

  // 상세 항목 추가
  const addDetail = () => {
    setDetails(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        responsibilityDetailContent: '',
        keyManagementTasks: '',
        relatedBasis: '',
      },
    ]);
  };

  // 상세 항목 제거
  const removeDetail = (id: string) => {
    setDetails(prev => prev.filter(d => d.id !== id));
  };

  // 상세 항목 입력 변경
  const handleDetailChange = (id: string, field: keyof ResponsibilityDetail, value: string) => {
    setDetails(prev => prev.map(d => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!responsibilityContent.trim()) {
      errors.responsibilityContent = '책무명은 필수 항목입니다.';
    }
    details.forEach((detail, index) => {
      if (!detail.responsibilityDetailContent.trim()) {
        errors[`detail_content_${index}`] = '책무 세부내용은 필수 항목입니다.';
      }
      if (!detail.keyManagementTasks.trim()) {
        errors[`detail_tasks_${index}`] = '주요 관리업무는 필수 항목입니다.';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        responsibilityContent: responsibilityContent,
        details: details.map(d => ({
          responsibilityDetailContent: d.responsibilityDetailContent,
          keyManagementTasks: d.keyManagementTasks,
          relatedBasis: d.relatedBasis,
        })),
      };

      if (mode === 'create') {
        await apiClient.post('/api/responsibilities', payload);
      } else if (mode === 'edit' && responsibilityId) {
        await apiClient.put(`/api/responsibilities/${responsibilityId}`, payload);
      }

      if (onSave) {
        onSave({
          responsibilityId: responsibilityId?.toString() || undefined,
          responsibilityContent: responsibilityContent,
          details,
        });
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || '저장 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 수정 모드 전환
  const handleEditMode = () => {
    if (onChangeMode) {
      onChangeMode('edit');
    }
  };

  const renderActions = () => {
    if (mode === 'view') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
          <Button onClick={onClose} variant='outlined'>
            닫기
          </Button>
          <Button onClick={handleEditMode} variant='contained' color='warning'>
            수정
          </Button>
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
        <Button onClick={onClose} variant='outlined'>
          취소
        </Button>
        <Button onClick={handleSave} variant='contained' color='success'>
          저장
        </Button>
      </Box>
    );
  };

  const isViewMode = mode === 'view';

  return (
    <Dialog open={open} onClose={onClose} title={getDialogTitle()} maxWidth='xl' fullWidth>
      <Box sx={{ p: 3 }}>
        {loading && <CircularProgress />}
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 책무 섹션 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant='h6' gutterBottom>
            책무
          </Typography>
          <TextField
            label='필수기재'
            fullWidth
            value={responsibilityContent}
            onChange={e => setResponsibilityContent(e.target.value)}
            InputProps={{ readOnly: isViewMode }}
            error={!!validationErrors.responsibilityContent}
            helperText={validationErrors.responsibilityContent}
          />
        </Box>

        {/* 책무 상세등록 섹션 */}
        <Box>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant='h6'>책무 상세등록</Typography>
            {!isViewMode && (
              <Button startIcon={<AddIcon />} onClick={addDetail}>
                상세 항목 추가
              </Button>
            )}
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '30%' }}>책무 세부내용</TableCell>
                  <TableCell sx={{ width: '40%' }}>책무이행을 위한 주요 관리업무</TableCell>
                  <TableCell sx={{ width: '30%' }}>관련 근거</TableCell>
                  {!isViewMode && <TableCell align='center'>동작</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {details.map(detail => (
                  <TableRow key={detail.id}>
                    <TableCell>
                      <TextField
                        label='필수기재'
                        multiline
                        minRows={3}
                        fullWidth
                        variant='outlined'
                        value={detail.responsibilityDetailContent}
                        onChange={e =>
                          handleDetailChange(
                            detail.id!,
                            'responsibilityDetailContent',
                            e.target.value
                          )
                        }
                        InputProps={{ readOnly: isViewMode }}
                        error={
                          !!validationErrors[
                            `detail_content_${details.findIndex(d => d.id === detail.id)}`
                          ]
                        }
                        helperText={
                          validationErrors[
                            `detail_content_${details.findIndex(d => d.id === detail.id)}`
                          ]
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label='필수기재'
                        multiline
                        minRows={3}
                        fullWidth
                        variant='outlined'
                        value={detail.keyManagementTasks}
                        onChange={e =>
                          handleDetailChange(detail.id!, 'keyManagementTasks', e.target.value)
                        }
                        InputProps={{ readOnly: isViewMode }}
                        error={
                          !!validationErrors[
                            `detail_tasks_${details.findIndex(d => d.id === detail.id)}`
                          ]
                        }
                        helperText={
                          validationErrors[
                            `detail_tasks_${details.findIndex(d => d.id === detail.id)}`
                          ]
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label='필수기재'
                        multiline
                        minRows={3}
                        fullWidth
                        variant='outlined'
                        value={detail.relatedBasis}
                        onChange={e =>
                          handleDetailChange(detail.id!, 'relatedBasis', e.target.value)
                        }
                        InputProps={{ readOnly: isViewMode }}
                      />
                    </TableCell>
                    {!isViewMode && (
                      <TableCell align='center'>
                        <IconButton
                          onClick={() => removeDetail(detail.id!)}
                          disabled={details.length <= 1}
                          color='error'
                        >
                          <RemoveIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {renderActions()}
      </Box>
    </Dialog>
  );
};

export default ResponsibilityDialog;
