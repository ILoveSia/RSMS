/**
 * 책무 등록/수정/조회 다이얼로그 컴포넌트
 */
import { apiClient } from '@/app/common/api/client';
import ResponsibilitySearchPopup, { type ResponsibilitySearchResult } from '@/domains/common/components/search/ResponsibilitySearchPopup';
import { Alert } from '@/shared/components/modal/Alert';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';
import { Box, Button, Typography } from '@mui/material';
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
  // id: string; // 프론트엔드에서 사용하는 임시 ID (required)
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
  positionName: string;
  rowData?: any; // row 데이터를 받을 props 추가
  onClose: () => void;
  onSave: () => void;
  onChangeMode: (mode: DialogMode) => void;
}

const ResponsibilityDialog: React.FC<IResponsibilityDialogProps> = ({
  open,
  mode,
  responsibilityId,
  rowData,
  onClose,
  onSave,
  onChangeMode,
}) => {
  // 원본 데이터 저장용 상태
  const [originalFormData, setOriginalFormData] = useState<FormData>({
    responsibilityContent: '',
    details: [
      {
        responsibilityDetailContent: '',
        keyManagementTasks: '',
        relatedBasis: '',
      },
    ],
  });

  // 현재 폼 데이터 (검색으로 변경될 수 있는 임시 데이터)
  const [formData, setFormData] = useState<FormData>({
    responsibilityContent: '',
    details: [
      {
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
  const [searchPopupOpen, setSearchPopupOpen] = useState(false);
  // 선택한 책무 데이터를 저장할 상태
  const [selectedResponsibilityData, setSelectedResponsibilityData] = useState<any>(null);
  const [responsibilityOverview, setResponsibilityOverview] = useState<string>('');
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
    console.log("rowData", rowData);

    if ((mode === 'edit' || mode === 'view') && rowData && open) {
      // PositionResponsibilityStatusPage에서 넘어온 데이터 구조 처리
      const initialData = {
        responsibilityContent: rowData.responsibilityContent || '', // 원본 데이터 표시
        details: [
          {
            responsibilityDetailId: String(rowData.id || ''),
            responsibilityDetailContent: rowData.responsibility_detail_content || '', // 원본 데이터 표시
            keyManagementTasks: rowData.keyManagementTasks || '', // 원본 데이터 표시
            relatedBasis: rowData.relatedBasis || '', // 원본 데이터 표시
          }
        ]
      };

      // 책무 개요는 rowData에서 직접 가져오기
      setResponsibilityOverview(rowData.responsibilityOverview || '');

      setOriginalFormData(initialData);
      setFormData(initialData);
    } else if (open && mode === 'create') {
      const initialData = {
        responsibilityContent: '',
        details: [
          {
            responsibilityDetailId: `temp-${Date.now()}`,
            responsibilityDetailContent: '',
            keyManagementTasks: '',
            relatedBasis: '',
          },
        ],
      };

      setResponsibilityOverview('');
      setOriginalFormData(initialData);
      setFormData(initialData);
    }
  }, [open, mode, responsibilityId, rowData]);



  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 책무 개요 검증
    if (!responsibilityOverview.trim()) {
      errors.responsibilityOverview = '책무 개요를 입력해주세요.';
    }

    // 책무 내용 검증
    if (!formData.responsibilityContent.trim()) {
      errors.responsibilityContent = '책무 내용을 입력해주세요.';
    }

    // 세부내용 검증
    if (!formData.details[0]?.responsibilityDetailContent?.trim()) {
      errors.responsibilityDetailContent = '책무 세부내용을 입력해주세요.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // 백엔드 DTO 구조에 맞게 데이터 변환
    const responsibilityRequestData = {
      positions_id: rowData?.positionId || responsibilityId || 1,
      responsibility_id: selectedResponsibilityData[0]?.id || 'null',
      updated_id: 'admin', // TODO: 실제 사용자 ID로 변경 필요
      role_summ: responsibilityOverview, // 책무 내용을 role_summ에 포함
    };
    try {
      setLoading(true);

      // 백엔드 API 호출
      const response = await apiClient.put('/position-responsibilities', responsibilityRequestData);

      // 저장 성공 시 현재 formData를 새로운 원본 데이터로 설정
      setOriginalFormData({ ...formData });

      await onSave();
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
        `/responsibilities/${responsibility.responsibilityId}`
      );

      // 응답 데이터를 상태에 저장 (PUT 요청 시 활용)
      setSelectedResponsibilityData(response);
      // 응답이 배열인지 확인
      if (!Array.isArray(response) || response.length === 0) {
        throw new Error('올바르지 않은 응답 형식입니다.');
      }

      // 첫 번째 항목에서 책무 내용 가져오기 (모든 항목이 같은 responsibilityContent를 가짐)
      const responsibilityContent = response[0].responsibilityContent || '';

      // 각 배열 항목을 details로 변환
      const details = response.map((item: ApiResponseItem, index: number) => ({
        // id: `${item.id}-${index}`, // 고유 ID 생성
        responsibilityDetailId: String(item.id),
        responsibilityDetailContent: item.responsibilityDetailContent || '',
        keyManagementTasks: item.responsibilityMgtSts || '',  // 실제 필드명 매핑
        relatedBasis: item.responsibilityRelEvid || '',       // 실제 필드명 매핑
      }));
      console.log("details", details)

      // 검색으로 선택한 데이터는 formData에만 설정 (임시 데이터)
      setFormData({
        responsibilityContent,
        details,
      });
    } catch (err) {
      console.error('책무 선택 중 오류 발생:', err);
      setError('책무 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };
  // 다이얼로그 닫기 핸들러 - 검색된 데이터를 버리고 원본 데이터로 복원
  const handleClose = () => {
    // 검색으로 변경된 데이터를 버리고 원본 데이터로 복원
    setFormData({ ...originalFormData });
    setSelectedResponsibilityData(null);
    onClose();
  };

  // 책무 내용 변경 함수 제거 - 검색을 통해서만 변경 가능

  // 세부내용 변경 함수 제거 - 검색을 통해서만 변경 가능

  return (
    <>
      <BaseDialog
        open={open}
        mode={mode}
        title={`책무 ${mode === 'create' ? '등록' : mode === 'edit' ? '수정' : '상세 정보'}`}
        onClose={handleClose}
        onSave={handleSave}
        onModeChange={onChangeMode}
        maxWidth="lg"
        fullWidth
        disableSave={loading}
        loading={loading}
      >


        <Box sx={{ p: 2 }}>
          {/* 직책 정보 */}
          <TextField
            sx={{ height: '100%', width: '100%', mb: 3 }}
            disabled={true}
            multiline
            rows={2}
            label="직책"
            value={rowData?.positionName || ''}
          />

          {/* 책무 개요 */}
          <TextField
            sx={{ height: '100%', width: '100%', mb: 3 }}
            multiline
            rows={2}
            label="책무 개요"
            disabled={mode === 'view'}
            onChange={(e) => setResponsibilityOverview(e.target.value)}
            value={responsibilityOverview}
            error={!!validationErrors.responsibilityOverview}
            helperText={validationErrors.responsibilityOverview}
          />

          {/* 검증 오류 메시지 표시 */}
          {(validationErrors.responsibilityContent || validationErrors.responsibilityDetailContent) && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography variant="body2" color="error">
                {validationErrors.responsibilityContent || validationErrors.responsibilityDetailContent}
              </Typography>
            </Box>
          )}

          {/* 깔끔한 레이아웃 구조 - ResponsibilityDialog와 동일한 형식 */}
          <Box sx={{ mb: 3 }}>
            {/* 라벨 행 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Box sx={{ flex: '0 0 25%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  책무 내용
                </Typography>
              </Box>
              <Box sx={{ flex: '0 0 25%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  책무 세부내용
                </Typography>
              </Box>
              <Box sx={{ flex: '0 0 25%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  책무이행을 위한 주요 관리업무
                </Typography>
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
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 2,
              alignItems: 'stretch'
            }}>
              {/* 책무 내용 */}
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.responsibilityContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibilityContent: e.target.value }))}
                  disabled={mode === 'view'}
                  placeholder="책무 내용을 입력하거나 검색을 통해 선택해주세요"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'flex-start'
                    }
                  }}
                />
              </Box>

              {/* 책무 세부내용 */}
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.details[0]?.responsibilityDetailContent || ''}
                  onChange={(e) => {
                    const newDetails = [...formData.details];
                    if (newDetails[0]) {
                      newDetails[0].responsibilityDetailContent = e.target.value;
                      setFormData(prev => ({ ...prev, details: newDetails }));
                    }
                  }}
                  disabled={mode === 'view'}
                  placeholder="책무 세부내용을 입력하거나 검색을 통해 선택해주세요"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'flex-start'
                    }
                  }}
                />
              </Box>

              {/* 주요 관리업무 */}
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.details[0]?.keyManagementTasks || ''}
                  onChange={(e) => {
                    const newDetails = [...formData.details];
                    if (newDetails[0]) {
                      newDetails[0].keyManagementTasks = e.target.value;
                      setFormData(prev => ({ ...prev, details: newDetails }));
                    }
                  }}
                  disabled={mode === 'view'}
                  placeholder="주요 관리업무를 입력하거나 검색을 통해 선택해주세요"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'flex-start'
                    }
                  }}
                />
              </Box>

              {/* 관련 근거 */}
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.details[0]?.relatedBasis || ''}
                  onChange={(e) => {
                    const newDetails = [...formData.details];
                    if (newDetails[0]) {
                      newDetails[0].relatedBasis = e.target.value;
                      setFormData(prev => ({ ...prev, details: newDetails }));
                    }
                  }}
                  disabled={mode === 'view'}
                  placeholder="관련 근거를 입력하거나 검색을 통해 선택해주세요"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'flex-start'
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* 책무 검색 버튼 */}
          {mode !== 'view' && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="medium"
                onClick={() => {
                  setSearchPopupOpen(true);
                }}
                color="primary"
                sx={{ minWidth: 120 }}
              >
                책무 검색
              </Button>
            </Box>
          )}
        </Box>
      </BaseDialog>
      <Alert
        open={showSuccessAlert}
        message={`책무가 ${mode === 'create' ? '등록' : '수정'}되었습니다.`}
        severity="success"
        autoHideDuration={2000}
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
