/**
 * 책무 등록/수정/조회 다이얼로그 컴포넌트
 */
import { apiClient } from '@/app/common/api/client';
import ResponsibilitySearchPopup, { type ResponsibilitySearchResult } from '@/domains/common/components/search/ResponsibilitySearchPopup';
import { Alert } from '@/shared/components/modal/Alert';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';
import { Box, Button, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ApprovalActionButton from '@/shared/components/approval/ApprovalActionButton';
import { useReduxState } from '@/app/store/use-store';

// LoginUser 타입 (loginStore용)
interface LoginUser {
  userid: string;
  username: string;
  email: string;
  role?: string;
}

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
  responsibility_detail_content: string;
  keyManagementTasks: string;
  // relatedBasis는 공통 항목이므로 제거
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
  // 추가 필드들
  ledgerOrdersId?: number | null;
  apprStatCd?: string;
  roleRespStatusId?: number | null;
  onClose: () => void;
  onSave: () => void;
  onChangeMode: (mode: DialogMode) => void;
}

const ResponsibilityDialog: React.FC<IResponsibilityDialogProps> = ({
  open,
  mode,
  responsibilityId,
  rowData,
  // 추가 필드들
  ledgerOrdersId,
  apprStatCd,
  roleRespStatusId,
  onClose,
  onSave,
  onChangeMode,
}) => {
  // 로그인 사용자 정보 가져오기
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const currentUserId = loginData?.userid || null;
  
  console.log('🔍 PositionResponsibilityDialog - 로그인 사용자 정보:', {
    loginData,
    currentUserId,
    hasLoginData: !!loginData,
    userid: loginData?.userid
  });
  
  // 원본 데이터 저장용 상태
  const [originalFormData, setOriginalFormData] = useState<FormData>({
    responsibilityContent: '',
    details: [
      {
        id: '1',
        responsibility_detail_content: '',
        keyManagementTasks: '',
      },
    ],
  });

  const [originalRelatedBasis, setOriginalRelatedBasis] = useState<string>('');

  // 현재 폼 데이터 (검색으로 변경될 수 있는 임시 데이터)
  const [formData, setFormData] = useState<FormData>({
    responsibilityContent: '',
    details: [
      {
        id: '1',
        responsibility_detail_content: '',
        keyManagementTasks: '',
      },
    ],
  });

  // 관련 근거는 공통 항목으로 별도 관리
  const [relatedBasis, setRelatedBasis] = useState<string>('');
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

  // 결재 상신 버튼 표시 여부 판단
  const shouldShowApprovalButton = () => {
    // appr_stat_cd가 빈 값이고 role_resp_status_id가 있으면 결재상신 버튼 표시
    const isApprStatEmpty = !apprStatCd || apprStatCd === '';
    const hasRoleRespStatusId = roleRespStatusId !== null && roleRespStatusId !== undefined && roleRespStatusId !== '';
    return isApprStatEmpty && hasRoleRespStatusId;
  };

  // 수정 버튼 표시 여부 판단
  const shouldShowEditButton = () => {
    // appr_stat_cd가 "APPROVED" 또는 "승인"이면 수정 버튼 숨김
    const isApproved = apprStatCd === 'APPROVED' || apprStatCd === '승인';
    console.log('🔧 수정버튼 표시 여부:', {
      apprStatCd,
      isApproved,
      shouldShow: !isApproved,
      mode
    });
    return !isApproved;
  };

  // 결재현황 버튼 표시 여부 판단
  const shouldShowApprovalStatusButton = () => {
    // appr_stat_cd가 있고 role_resp_status_id가 있으면 결재현황 버튼 표시
    const hasApprStat = apprStatCd && apprStatCd !== '';
    const hasRoleRespStatusId = roleRespStatusId !== null && roleRespStatusId !== undefined && roleRespStatusId !== '';
    return hasApprStat && hasRoleRespStatusId;
  };


  // 데이터 초기화 및 로드
  useEffect(() => {
    if (open) {
      console.log('📋 PositionResponsibilityDialog - 받은 데이터:', {
        ledgerOrdersId,
        apprStatCd,
        roleRespStatusId,
        rowData
      });
    }
    
    if ((mode === 'edit' || mode === 'view') && rowData && open) {
      // PositionResponsibilityStatusPage에서 넘어온 데이터 구조 처리
      // allDetails의 모든 항목을 처리
      const initialData = {
        responsibilityContent: rowData.responsibilityContent || '', // 공통 항목
        details: rowData.allDetails?.map((detail: any, index: number) => ({
          id: String(detail.id || index + 1),
          responsibilityDetailId: String(detail.id || ''),
          responsibility_detail_content: detail.responsibility_detail_content || '',
          keyManagementTasks: detail.responsibility_mgt_sts || '',
        })) || [
            {
              id: '1',
              responsibilityDetailId: String(rowData.id || ''),
              responsibility_detail_content: '',
              keyManagementTasks: '',
            }
          ]
      };

      // 공통 항목들 설정
      setResponsibilityOverview(rowData.responsibilityOverview || '');
      setRelatedBasis(rowData.relatedBasis || '');
      setOriginalRelatedBasis(rowData.relatedBasis || '');
      setSelectedResponsibilityData({responsibility_id: rowData.id || '', 
        responsibilityContent: rowData.responsibilityContent || '', 
        responsibilityDetailContent: rowData.responsibilityDetailContent || '', 
        responsibilityRelEvid: rowData.responsibilityRelEvid || '',
        responsibilityMgtSts: rowData.responsibilityMgtSts || ''});

      setOriginalFormData(initialData);
      setFormData(initialData);
    } else if (open && mode === 'create') {
      const initialData = {
        responsibilityContent: '',
        details: [
          {
            id: `temp-${Date.now()}`,
            responsibilityDetailId: `temp-${Date.now()}`,
            responsibility_detail_content: '',
            keyManagementTasks: '',
          },
        ],
      };

      setResponsibilityOverview('');
      setRelatedBasis('');
      setOriginalRelatedBasis('');
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
    formData.details.forEach((detail, index) => {
      if (!detail.responsibility_detail_content?.trim()) {
        errors[`detail_${index}_content`] = '책무 세부내용을 입력해주세요.';
      }
      if (!detail.keyManagementTasks?.trim()) {
        errors[`detail_${index}_tasks`] = '주요 관리업무를 입력해주세요.';
      }
    });

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
      responsibility_id: selectedResponsibilityData[0]?.id || rowData.allDetails[0].responsibility_id||'null',
      updated_id: 'admin', // TODO: 실제 사용자 ID로 변경 필요
      role_summ: responsibilityOverview, // 책무 내용을 role_summ에 포함
      // 조건에 따라 ledger_order 값 설정: role_resp_status_id가 없으면 props의 ledgerOrdersId 사용
      ledger_order: roleRespStatusId ? (rowData?.ledger_orders_id || null) : (ledgerOrdersId || null),
    };
    
    console.log('💾 저장 데이터:', {
      responsibilityRequestData,
      conditions: {
        roleRespStatusId,
        ledgerOrdersId,
        apprStatCd,
        usedLedgerOrder: roleRespStatusId ? (rowData?.ledger_orders_id || null) : (ledgerOrdersId || null)
      }
    });
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

      // 첫 번째 항목에서 책무 내용과 관련 근거 가져오기 (모든 항목이 같은 값을 가짐)
      const responsibilityContent = response[0].responsibilityContent || '';
      const relatedBasisData = response[0].responsibilityRelEvid || '';
      
      // 각 배열 항목을 details로 변환
      const details = response.map((item: ApiResponseItem, index: number) => ({
        id: `${item.id}-${index}`, // 고유 ID 생성
        responsibilityDetailId: String(item.id),
        responsibility_detail_content: item.responsibilityDetailContent || '',
        keyManagementTasks: item.responsibilityMgtSts || '',  // 실제 필드명 매핑
        relatedBasis: item.responsibilityRelEvid || '',       // 실제 필드명 매핑
      }));

      // 검색으로 선택한 데이터 설정
      setFormData({
        responsibilityContent,
        details,
      });
      
      // 관련 근거는 공통 항목이므로 별도 상태에 설정
      setRelatedBasis(relatedBasisData);
    } catch (err) {
      console.error('책무 선택 중 오류 발생:', err);
      setError('책무 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };
  // 다이얼로그 닫기 핸들러 - 검색된 데이터를 버리고 원본 데이터로 복원
  const handleClose = () => {
    // 검색으로 변경된 데이터를 버리고 원본 데이터로 복원
    setFormData({ ...originalFormData });
    setRelatedBasis(originalRelatedBasis);
    setSelectedResponsibilityData(null);
    onClose();
  };

  // 책무 내용 변경 함수 제거 - 검색을 통해서만 변경 가능

  // 세부내용 변경 함수 제거 - 검색을 통해서만 변경 가능

  // 커스텀 액션 버튼들 생성
  const renderCustomActions = () => {
    const actions = [];
    const taskIdNumber = typeof roleRespStatusId === 'string' 
      ? parseInt(roleRespStatusId, 10) 
      : Number(roleRespStatusId) || 0;

    // 결재 상신 버튼 (appr_stat_cd가 없고 role_resp_status_id가 있을 때)
    if (shouldShowApprovalButton()) {
      console.log('🔵 결재 상신 버튼 표시:', {
        taskType: 'role_resp_status',
        originalRoleRespStatusId: roleRespStatusId,
        convertedTaskId: taskIdNumber,
        taskIdType: typeof taskIdNumber
      });
      
      actions.push(
        <ApprovalActionButton
          key="approval-submit"
          taskType="role_resp_status"
          taskId={taskIdNumber}
          taskTitle={`직책별 책무현황 - ${rowData?.positionName || '직책명'}`}
          currentUserId={currentUserId || ''}
          onApprovalStateChange={() => {
            console.log('🔄 결재 상태 변경됨');
            onSave?.(); // 부모 컴포넌트에 상태 변경 알림
          }}
          size="small"
          variant="contained"
          disabled={loading || !currentUserId}
        />
      );
    }

    // 결재 현황 버튼 (appr_stat_cd가 있고 role_resp_status_id가 있을 때)
    if (shouldShowApprovalStatusButton()) {
      console.log('🔍 결재 현황 버튼 표시:', {
        taskType: 'role_resp_status',
        taskId: taskIdNumber,
        apprStatCd: apprStatCd
      });
      
      actions.push(
        <ApprovalActionButton
          key="approval-status"
          taskType="role_resp_status"
          taskId={taskIdNumber}
          taskTitle={`직책별 책무현황 - ${rowData?.positionName || '직책명'}`}
          currentUserId={currentUserId || ''}
          onApprovalStateChange={() => {
            console.log('🔄 결재 상태 변경됨');
            onSave?.(); // 부모 컴포넌트에 상태 변경 알림
          }}
          size="small"
          variant="outlined"
          disabled={loading || !currentUserId}
        />
      );
    }

    return actions.length > 0 ? <Box sx={{ mr: 1 }}>{actions}</Box> : null;
  };

  return (
    <>
      <BaseDialog
        open={open}
        mode={shouldShowEditButton() ? mode : 'view'} // 결재상태가 "승인"이면 view 모드로 강제 변경
        title={`책무 ${mode === 'create' ? '등록' : mode === 'edit' ? '수정' : '상세 정보'}`}
        onClose={handleClose}
        onSave={handleSave}
        onModeChange={onChangeMode}
        maxWidth="lg"
        fullWidth
        disableSave={loading}
        loading={loading}
        showEditButton={shouldShowEditButton()} // 결재상태가 승인이면 수정 버튼 숨김
        customActions={renderCustomActions()}
      >


        <Box sx={{ p: 2 }}>
          {/* 직책 정보 */}
          <TextField
            sx={{ width: '100%', mb: 3 }}
            mode="readonly"
            multiline
            rows={1}
            label="직책"
            value={rowData?.positionName || ''}
          />

          {/* 책무 개요 */}
          <TextField
            sx={{ height: '100%', width: '100%', mb: 3 }}
            multiline
            mode={mode === 'view' ? 'readonly' : 'editable'}
            rows={2}
            label="책무 개요"
            disabled={mode === 'view'}
            onChange={(e) => setResponsibilityOverview(e.target.value)}
            value={responsibilityOverview}
            error={!!validationErrors.responsibilityOverview}
            helperText={validationErrors.responsibilityOverview}
          />

          {/* 검증 오류 메시지 표시 */}
          {Object.keys(validationErrors).length > 0 && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography variant="body2" color="error">
                {Object.values(validationErrors)[0]}
              </Typography>
            </Box>
          )}

          {/* ResponsibilityDialog와 동일한 레이아웃 구조 */}
          <Box sx={{ mb: 3 }}>
            {/* 라벨 행 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Box sx={{ flex: '0 0 25%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  책무 내용
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
                    책무이행을 위한 주요 관리업무
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
              {/* 책무 내용 (고정) */}
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  multiline
                  value={formData.responsibilityContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibilityContent: e.target.value }))}
                  mode='readonly'
                  placeholder="책무 내용을 입력하거나 검색을 통해 선택해주세요"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'flex-start'
                    }
                  }}
                />
              </Box>

              {/* 가운데 동적 컬럼들 (세부내용 + 관리업무) */}
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
                          value={detail.responsibility_detail_content || ''}
                          onChange={(e) => {
                            const newDetails = [...formData.details];
                            newDetails[index].responsibility_detail_content = e.target.value;
                            setFormData(prev => ({ ...prev, details: newDetails }));
                          }}
                          mode="readonly"
                          error={!!validationErrors[`detail_${index}_content`]}
                          helperText={validationErrors[`detail_${index}_content`]}
                          placeholder="책무 세부내용을 입력하세요"
                        />
                      </Grid>
                      {/* 주요 관리업무 */}
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={detail.keyManagementTasks || ''}
                            onChange={(e) => {
                              const newDetails = [...formData.details];
                              newDetails[index].keyManagementTasks = e.target.value;
                              setFormData(prev => ({ ...prev, details: newDetails }));
                            }}
                            mode="readonly"
                            error={!!validationErrors[`detail_${index}_content`]}
                            helperText={validationErrors[`detail_${index}_content`]}
                            placeholder="주요 관리업무를 입력하세요"
                          />
                          {mode !== 'view' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    details: [
                                      ...prev.details,
                                      {
                                        id: `temp-${Date.now()}`,
                                        responsibility_detail_content: '',
                                        keyManagementTasks: '',
                                      },
                                    ],
                                  }));
                                }}
                                sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem' }}
                              >
                                +
                              </Button>
                              {formData.details.length > 1 && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      details: prev.details.filter(d => d.id !== detail.id),
                                    }));
                                  }}
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
                  value={relatedBasis}
                  onChange={(e) => setRelatedBasis(e.target.value)}
                  mode="readonly"
                  placeholder="관련 근거를 입력하세요"
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
