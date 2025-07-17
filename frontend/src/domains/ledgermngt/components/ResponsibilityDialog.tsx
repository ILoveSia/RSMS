/**
 * 책무 등록/수정/조회 다이얼로그 컴포넌트
 */
import { apiClient } from '@/app/common/api/client';
import Alert from '@/shared/components/modal/Alert';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
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
  id: string; // 프론트엔드에서 사용하는 임시 ID (required)
  responsibilityDetailId?: string; // 백엔드 ID (optional)
  responsibilityDetailContent: string;
  keyManagementTasks: string;
  relatedBasis: string;
}

interface FormData {
  responsibilityContent: string;
  details: ResponsibilityDetail[];
}

interface IResponsibilityDialogProps {
  open: boolean;
  mode: DialogMode;
  responsibilityId: number | null;
  onClose: () => void;
  onSave: () => void;
  onChangeMode: (mode: DialogMode) => void;
}

const ResponsibilityDialog: React.FC<IResponsibilityDialogProps> = ({
  open,
  mode,
  responsibilityId,
  onClose,
  onSave,
  onChangeMode,
}) => {
  const [formData, setFormData] = useState<FormData>({
    responsibilityContent: '',
    details: [
      {
        id: '1',
        responsibilityDetailContent: '',
        keyManagementTasks: '',
        relatedBasis: '',
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

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

        setFormData({
          responsibilityContent: fetchedData.responsibilityContent,
          details: fetchedData.details.map((d: DetailResponseType) => ({
            id: String(d.id),
            responsibilityDetailId: String(d.id),
            responsibilityDetailContent: d.responsibilityDetailContent,
            keyManagementTasks: d.keyManagementTasks,
            relatedBasis: d.relatedBasis,
          })),
        });
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
    } else if (open && mode === 'create') {
      console.log('[ResponsibilityDialog useEffect] 새로운 폼 초기화');
      setFormData({
        responsibilityContent: '',
        details: [
          {
            id: `temp-${Date.now()}`,
            responsibilityDetailContent: '',
            keyManagementTasks: '',
            relatedBasis: '',
          },
        ],
      });
    }
  }, [open, mode, responsibilityId]);

  // 세부내용 추가
  const addDetail = () => {
    setFormData(prev => ({
      ...prev,
      details: [
        ...prev.details,
        {
          id: `temp-${Date.now()}`,
          responsibilityDetailContent: '',
          keyManagementTasks: '',
          relatedBasis: '',
        },
      ],
    }));
  };

  // 세부내용 삭제
  const removeDetail = (id: string) => {
    if (formData.details.length === 1) return;
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter(detail => detail.id !== id),
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.responsibilityContent.trim()) {
      errors.responsibilityContent = '책무 내용을 입력해주세요.';
    }

    formData.details.forEach((detail, index) => {
      if (!detail.responsibilityDetailContent.trim()) {
        errors[`detail_${index}_content`] = '책무 세부내용을 입력해주세요.';
      }
      if (!detail.keyManagementTasks.trim()) {
        errors[`detail_${index}_tasks`] = '주요 관리업무를 입력해주세요.';
      }
      if (!detail.relatedBasis.trim()) {
        errors[`detail_${index}_basis`] = '관련 근거를 입력해주세요.';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    const responsibilityRequestData = {
      responsibilityContent: formData.responsibilityContent,
      details: formData.details.map(d => ({
        responsibilityDetailContent: d.responsibilityDetailContent,
        keyManagementTasks: d.keyManagementTasks,
        relatedBasis: d.relatedBasis,
      })),
    };
    console.log("responsibilityRequestData", responsibilityRequestData);
    try {
      setLoading(true);
      // TODO: API 호출로 책무 저장
      let response: ResponsibilityData;
      if (mode === 'create') {
        response = await apiClient.post('/api/responsibilities', responsibilityRequestData);
      } else {
        response = await apiClient.put(`/api/responsibilities/${responsibilityId}`, responsibilityRequestData);
      }

      await onSave();

      setShowSuccessAlert(true);
      onClose();
    } catch (err) {
      console.error('책무 저장 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 책무 내용 변경
  const handleContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilityContent: value,
    }));
  };

  // 세부내용 변경
  const handleDetailChange = (id: string, field: keyof ResponsibilityDetail, value: string) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.map(detail =>
        detail.id === id ? { ...detail, [field]: value } : detail
      ),
    }));
  };

  return (
    <>
      <BaseDialog
        open={open}
        mode={mode}
        title={`책무 ${mode === 'create' ? '등록' : mode === 'edit' ? '수정' : '상세 정보'}`}
        onClose={onClose}
        onSave={handleSave}
        onModeChange={onChangeMode}
        maxWidth="lg"
        fullWidth
        disableSave={loading}
        loading={loading}
      >
        <Box sx={{ p: 2 }}>
          {/* 책무 내용 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              책무 내용
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.responsibilityContent}
              onChange={(e) => handleContentChange(e.target.value)}
              disabled={mode === 'view'}
              error={!!validationErrors.responsibilityContent}
              helperText={validationErrors.responsibilityContent}
              placeholder="책무 내용을 입력하세요"
            />
          </Box>

          {/* 세부내용 목록 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                세부내용 목록
              </Typography>
              {mode !== 'view' && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addDetail}
                  size="small"
                >
                  세부내용 추가
                </Button>
              )}
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>책무 세부내용</TableCell>
                    <TableCell>책무이행을 위한 주요 관리업무</TableCell>
                    <TableCell>관련 근거</TableCell>
                    {mode !== 'view' && <TableCell width={50}>삭제</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={detail.responsibilityDetailContent || ''}
                          onChange={(e) =>
                            handleDetailChange(detail.id || '', 'responsibilityDetailContent', e.target.value)
                          }
                          disabled={mode === 'view'}
                          error={!!validationErrors[`detail_${detail.id}_content`]}
                          helperText={validationErrors[`detail_${detail.id}_content`]}
                          placeholder="세부내용을 입력하세요"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={detail.keyManagementTasks || ''}
                          onChange={(e) =>
                            handleDetailChange(detail.id || '', 'keyManagementTasks', e.target.value)
                          }
                          disabled={mode === 'view'}
                          error={!!validationErrors[`detail_${detail.id}_tasks`]}
                          helperText={validationErrors[`detail_${detail.id}_tasks`]}
                          placeholder="주요 관리업무를 입력하세요"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={detail.relatedBasis || ''}
                          onChange={(e) =>
                            handleDetailChange(detail.id || '', 'relatedBasis', e.target.value)
                          }
                          disabled={mode === 'view'}
                          error={!!validationErrors[`detail_${detail.id}_basis`]}
                          helperText={validationErrors[`detail_${detail.id}_basis`]}
                          placeholder="관련 근거를 입력하세요"
                        />
                      </TableCell>
                      {mode !== 'view' && (
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => removeDetail(detail.id)}
                            disabled={formData.details.length === 1}
                            color="error"
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
        </Box>
      </BaseDialog>

      <Alert
        open={showSuccessAlert}
        message={`책무가 ${mode === 'create' ? '등록' : '수정'}되었습니다.`}
        severity="success"
        autoHideDuration={2000}
        onClose={() => setShowSuccessAlert(false)}
      />
    </>
  );
};

export default ResponsibilityDialog;
