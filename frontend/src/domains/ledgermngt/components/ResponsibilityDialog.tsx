/**
 * 책무 등록/수정/조회 다이얼로그 컴포넌트
 */
import { apiClient } from '@/app/common/api/client';
import ResponsibilitySearchPopup, { type ResponsibilitySearchResult } from '@/domains/common/components/search/ResponsibilitySearchPopup';
import { Button } from '@/shared/components';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';
import Toast from '@/shared/components/ui/feedback/Toast';
import { Alert, Box, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import responsibilityApi from '../api/responsibilityApi';
import { positionApi } from '../api/positionApi';

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
  ledgerOrder?: number; // 원장차수 ID (신규 등록시 사용)
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
  ledgerOrder?: number; // 원장차수 ID (신규 등록시 사용)
}

interface IResponsibilityDialogProps {
  open: boolean;
  mode: DialogMode;
  responsibilityId: number | null;
  positionName: string;
  rowData?: any; // row 데이터를 받을 props 추가
  selectedLedgerOrder?: string; // 원장차수 값 (신규 등록시만 사용)
  isReadOnly?: boolean; // 최종확정 상태일 때 수정 제한
  onClose: () => void;
  onSave: () => void;
  onChangeMode: (mode: DialogMode) => void;
}

const ResponsibilityDialog: React.FC<IResponsibilityDialogProps> = ({
  open,
  mode,
  responsibilityId,
  positionName,
  rowData,
  selectedLedgerOrder,
  isReadOnly = false,
  onClose,
  onSave,
  onChangeMode,
}) => {
  // Debug 로그 추가
  console.log('📋 ResponsibilityDialog Props:', { 
    mode, 
    isReadOnly, 
    rowData: rowData?.ledgerOrdersStatusCd 
  });
  
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
  const [, setError] = useState<string | null>(null);
  const [searchPopupOpen, setSearchPopupOpen] = useState(false);


  // 데이터 초기화 및 로드
  useEffect(() => {
    const fetchDetails = async (id: string) => {
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

        const response = await apiClient.get<ApiSuccessResponse<ResponseType> | ResponseType>(`/api/responsibilities/${id}`);


        // ApiResponse 래퍼 구조인지 확인하여 적절히 처리
        let fetchedData: ResponseType;
        if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
          // ApiResponse 래퍼 구조인 경우
          const apiResponse = response as ApiSuccessResponse<ResponseType>;
          if (apiResponse.success && apiResponse.data) {
            fetchedData = apiResponse.data;
          } else {
            throw new Error(apiResponse.message || '데이터를 불러오는 데 실패했습니다.');
          }
        } else if (response) {
          // 이미 unwrap된 데이터인 경우
          fetchedData = response as ResponseType;
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
      } catch (err) {
        const error = err as Error;
        setError(error.message || '상세 정보를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if ((mode === 'edit' || mode === 'view') && responsibilityId != null && open) {
      // 수정/조회 모드에서는 rowData가 있으면 우선 사용, 없으면 API 호출
      if (rowData) {
        // 그룹핑된 데이터인지 확인 (allDetails 배열이 있는 경우)
        if (rowData.allDetails && Array.isArray(rowData.allDetails)) {
          // 그룹핑된 여러 세부항목들을 모두 표시
          setFormData({
            responsibilityContent: rowData.responsibilityContent || '',
            details: rowData.allDetails.map((detail: any, index: number) => ({
              id: String(detail.responsibilityDetailId || index),
              responsibilityDetailId: String(detail.responsibilityDetailId),
              responsibilityDetailContent: detail.responsibilityDetailContent || '',
              keyManagementTasks: detail.responsibilityMgtSts || '',
              relatedBasis: detail.responsibilityRelEvid || '',
            }))
          });
        } else {
          // 단일 ResponsibilityRow 타입에 맞게 데이터 로드
          setFormData({
            responsibilityContent: rowData.responsibilityContent || '',
            details: [
              {
                id: String(rowData.responsibilityDetailId),
                responsibilityDetailId: String(rowData.responsibilityDetailId),
                responsibilityDetailContent: rowData.responsibilityDetailContent || '',
                keyManagementTasks: rowData.responsibilityMgtSts || '',
                relatedBasis: rowData.responsibilityRelEvid || '',
              }
            ]
          });
        }
      } else {
        // rowData가 없으면 API 호출
        fetchDetails(responsibilityId.toString());
      }
    } else if (open && mode === 'create') {
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
  }, [open, mode, responsibilityId, rowData]);



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
          relatedBasis: prev.details[0]?.relatedBasis || '', // 기존 관련 근거 값 복사
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

    try {
      setLoading(true);
      
      // 백엔드 DTO 구조에 맞게 데이터 변환
      let responsibilityRequestData: any = {
        responsibilityContent: formData.responsibilityContent,
        details: formData.details.map(detail => ({
          responsibilityDetailContent: detail.responsibilityDetailContent,
          keyManagementTasks: detail.keyManagementTasks,
          relatedBasis: detail.relatedBasis
        }))
      };

      // 신규 등록시에만 원장차수 값 처리
      if (mode === 'create' && selectedLedgerOrder && selectedLedgerOrder !== 'ALL') {
        
        
        try {
          // 원장차수 제목으로 ledger_orders_id 조회
          const ledgerOrdersId = await positionApi.getLedgerOrdersIdByTitle(selectedLedgerOrder);
          
          
          // 백엔드 요청 데이터에 ledgerOrder 추가
          responsibilityRequestData.ledgerOrder = ledgerOrdersId;
          
        } catch (error) {
          console.error('❌ 원장차수 ID 조회 실패:', selectedLedgerOrder, error);
          setError('원장차수 정보를 조회할 수 없습니다.');
          return;
        }
      }

      

      // 백엔드 API 호출
      if (responsibilityId) {
        await responsibilityApi.update(responsibilityId, responsibilityRequestData);
      } else {
        await responsibilityApi.create(responsibilityRequestData);
      }

      onSave();
      setShowSuccessAlert(true);
      onClose();
    } catch (err: any) {
      console.error('책무 저장 실패:', err);
      console.error('에러 상세:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSelect = async (responsibility: ResponsibilitySearchResult) => {
    try {
      // 실제 API 응답 구조에 맞는 타입 정의
      type ApiResponseItem = {
        id: number;
        responsibilityContent: string;
        responsibilityDetailContent: string;
        responsibilityRelEvid: string;  // 관련 근거
        responsibilityMgtSts: string;   // 주요 관리업무
      };

      const response = await apiClient.get<ApiResponseItem[]>(
        `/api/responsibilities/${responsibility.responsibilityId}`
      );


      // 응답 데이터 확인
      console.log('선택한 책무 데이터:', response);

      // 응답이 배열인지 확인
      if (!Array.isArray(response) || response.length === 0) {
        throw new Error('올바르지 않은 응답 형식입니다.');
      }

      // 첫 번째 항목에서 책무 내용 가져오기 (모든 항목이 같은 responsibilityContent를 가짐)
      const responsibilityContent = response[0].responsibilityContent || '';

      // 각 배열 항목을 details로 변환
      const details = response.map((item: ApiResponseItem, index: number) => ({
        id: `${item.id}-${index}`, // 고유 ID 생성
        responsibilityDetailId: String(item.id),
        responsibilityDetailContent: item.responsibilityDetailContent || '',
        keyManagementTasks: item.responsibilityMgtSts || '',  // 실제 필드명 매핑
        relatedBasis: item.responsibilityRelEvid || '',       // 실제 필드명 매핑
      }));



      setFormData({
        responsibilityContent,
        details,
      });
    } catch (err) {
      console.error('책무 선택 중 오류 발생:', err);
      setError('책무 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };


  // 세부내용 변경
  const handleDetailChange = (id: string, field: keyof ResponsibilityDetail, value: string) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.map(detail => {
        if (detail.id === id) {
          return { ...detail, [field]: value };
        }
        // 관련 근거는 모든 detail에 동일하게 적용
        if (field === 'relatedBasis') {
          return { ...detail, [field]: value };
        }
        return detail;
      }),
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
        onModeChange={isReadOnly ? undefined : onChangeMode}
        showEditButton={!isReadOnly}
        maxWidth="lg"
        fullWidth
        disableSave={loading}
        loading={loading}
      >


        <Box sx={{ p: 2 }}>
          {/* 최종확정 상태 안내 */}
          {isReadOnly && mode === 'view' && (
            <Alert severity='warning' sx={{ mb: 2 }}>
              이 데이터는 최종확정 상태이므로 수정할 수 없습니다.
            </Alert>
          )}
          
          {/* 깔끔한 레이아웃 구조 */}
          <Box sx={{ mb: 3 }}>
            {/* 라벨 행 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Box sx={{ flex: '0 0 25%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  책무
                </Typography>
              </Box>
              <Box sx={{ flex: '0 0 50%', display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    책무 세부내용
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    책무이행을 위한 주요 관리의무
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: '0 0 25%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  관련 근거
                </Typography>
              </Box>
            </Box>

            {/* 메인 컨텐츠 - CSS Grid 사용 */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              gap: 2,
              alignItems: 'stretch'
            }}>
              {/* 책무 (고정) */}
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  multiline
                  label="책무"
                  value={formData.responsibilityContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibilityContent: e.target.value }))}
                  mode={mode === 'view' ? 'readonly' : 'editable'}
                  error={!!validationErrors.responsibilityContent}
                  helperText={validationErrors.responsibilityContent}
                  placeholder="책무 내용을 입력하세요"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'flex-start'
                    },
                    '& .MuiInputBase-input': {
                      color: '#333 !important',
                      WebkitTextFillColor: '#333 !important',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      color: '#333 !important',
                      WebkitTextFillColor: '#333 !important',
                    }
                  }}
                />
              </Box>

              {/* 가운데 동적 컬럼들 (세부내용 + 관리의무) */}
              <Box>
                <Grid container spacing={2}>
                  {formData.details.map((detail, index) => (
                    <React.Fragment key={detail.id}>
                      {/* 책무 세부내용 */}
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="책무 세부내용"
                          value={detail.responsibilityDetailContent || ''}
                          onChange={(e) =>
                            handleDetailChange(detail.id || '', 'responsibilityDetailContent', e.target.value)
                          }
                          mode={mode === 'view' ? 'readonly' : 'editable'}
                          error={!!validationErrors[`detail_${detail.id}_content`]}
                          helperText={validationErrors[`detail_${detail.id}_content`]}
                          placeholder="책무 세부내용을 입력하세요"
                          sx={{
                            '& .MuiInputBase-input': {
                              color: '#333 !important',
                              WebkitTextFillColor: '#333 !important',
                            },
                            '& .MuiInputBase-input.Mui-disabled': {
                              color: '#333 !important',
                              WebkitTextFillColor: '#333 !important',
                            }
                          }}
                        />
                      </Grid>
                      {/* 주요 관리의무 */}
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="주요 관리의무"
                            value={detail.keyManagementTasks || ''}
                            onChange={(e) =>
                              handleDetailChange(detail.id || '', 'keyManagementTasks', e.target.value)
                            }
                            mode={mode === 'view' ? 'readonly' : 'editable'}
                            error={!!validationErrors[`detail_${detail.id}_tasks`]}
                            helperText={validationErrors[`detail_${detail.id}_tasks`]}
                            placeholder="주요 관리의무를 입력하세요"
                            sx={{
                              '& .MuiInputBase-input': {
                                color: '#333 !important',
                                WebkitTextFillColor: '#333 !important',
                              },
                              '& .MuiInputBase-input.Mui-disabled': {
                                color: '#333 !important',
                                WebkitTextFillColor: '#333 !important',
                              }
                            }}
                          />
                          {mode !== 'view' && !isReadOnly && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={addDetail}
                                sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem' }}
                              >
                                +
                              </Button>
                              {formData.details.length > 1 && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => removeDetail(detail.id)}
                                  sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem' }}
                                >
                                  -
                                </Button>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
              </Box>

              {/* 관련 근거 (고정, 공통) */}
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  multiline
                  label="관련 근거"
                  value={formData.details[0]?.relatedBasis || ''}
                  onChange={(e) =>
                    handleDetailChange(formData.details[0]?.id || '', 'relatedBasis', e.target.value)
                  }
                  mode={mode === 'view' ? 'readonly' : 'editable'}
                  error={!!validationErrors[`detail_${formData.details[0]?.id}_basis`]}
                  helperText={validationErrors[`detail_${formData.details[0]?.id}_basis`]}
                  placeholder="관련 근거를 입력하세요"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'flex-start'
                    },
                    '& .MuiInputBase-input': {
                      color: '#333 !important',
                      WebkitTextFillColor: '#333 !important',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      color: '#333 !important',
                      WebkitTextFillColor: '#333 !important',
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>


        </Box>
      </BaseDialog>
      <Toast
        open={showSuccessAlert}
        message={`책무가 ${mode === 'create' ? '등록' : '수정'}되었습니다.`}
        severity="success"
        onClose={() => setShowSuccessAlert(false)}
      />
      <ResponsibilitySearchPopup
        open={searchPopupOpen}
        onClose={() => setSearchPopupOpen(false)}
        onSelect={handleSelect}
      />
    </>
  );
};

export default ResponsibilityDialog;
