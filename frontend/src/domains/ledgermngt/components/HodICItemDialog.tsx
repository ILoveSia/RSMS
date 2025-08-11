import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import {
  DepartmentSearchPopup,
  ResponsibilitySearchPopup,
  type Department,
  type ResponsibilitySearchResult,
} from '@/domains/common/components/search';
import ApprovalActionButton from '@/shared/components/approval/ApprovalActionButton';
import type { SelectOption } from '@/shared/types/common';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Select, LedgerOrdersHodSelect } from '@/shared/components/ui/form';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { TextField } from '@/shared/components/ui/data-display/';
import React, { useCallback, useEffect, useState } from 'react';
import type { HodICItemCreateRequest } from '../api/hodIcItemApi';
import { hodICItemApi } from '../api/hodIcItemApi';
import { apiClient } from '@/app/common/api/client';

interface HodICItemDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  itemId?: number;
  approvalStatus?: string;
  onSuccess?: () => void;
}

interface FormData {
  // 책무ID 관련
  responsibilityId: number | '';
  responsibilityContent: string; // 책무내용 표시용
  responsibilityDetailId: number | '';
  responsibilityDetailContent: string; // 책무상세내용 표시용

  // 부서 관련
  deptCd: string;
  deptName: string; // 부서명 표시용

  // 책무번호
  ledgerOrders: number; // 책무번호(원장차수)

  // 공통코드 관련 필드들
  fieldTypeCd: string; // 항목구분
  roleTypeCd: string; // 직무구분
  periodCd: string; // 주기
  checkPeriod: string; // 점검시기

  // 조치활동ID
  measureId: string; // 조치활동ID

  // 텍스트 필드들
  icTask: string; // 내부통제업무
  measureDesc: string; // 조치활동
  measureType: string; // 조치유형
  supportDoc: string; // 관련근거
  checkWay: string; // 점검방법

}

const initialFormData: FormData = {
  responsibilityId: '',
  responsibilityContent: '',
  responsibilityDetailId: '',
  responsibilityDetailContent: '',
  deptCd: '',
  deptName: '',
  ledgerOrders: 0,
  fieldTypeCd: '',
  roleTypeCd: '',
  periodCd: '',
  checkPeriod: '',
  measureId: '',
  icTask: '',
  measureDesc: '',
  measureType: '',
  supportDoc: '',
  checkWay: '',
};

// LoginUser 타입 (loginStore용)
interface LoginUser {
  userid: string;
  username: string;
  email: string;
  role?: string;
}

const HodICItemDialog: React.FC<HodICItemDialogProps> = ({
  open,
  onClose,
  mode: initialMode,
  itemId,
  approvalStatus,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>(initialMode);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인 사용자 정보 가져오기
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const currentUserId = loginData?.userid || null;
  
  console.log('🔍 HodICItemDialog - 로그인 사용자 정보:', {
    loginData,
    currentUserId,
    hasLoginData: !!loginData,
    userid: loginData?.userid
  });

  // 팝업 상태들
  const [responsibilitySearchOpen, setResponsibilitySearchOpen] = useState(false);
  const [responsibilityDetailSearchOpen, setResponsibilityDetailSearchOpen] = useState(false);
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);

  // 책무상세 목록 상태
  const [responsibilityDetails, setResponsibilityDetails] = useState<ResponsibilityDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

// 책무상세 타입 정의
interface ResponsibilityDetail {
  responsibilityDetailId: number;
  responsibilityDetailContent: string;
  responsibilityRelEvid: string;
}

  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes } = useReduxState<{ data: CommonCode[] } | CommonCode[]>(
    'codeStore/allCodes'
  );

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  // 결재 상신 버튼 표시 여부 판단
  const shouldShowApprovalButton = () => {
    return approvalStatus === 'NONE' && itemId;
  };

  // 결재현황 버튼 표시 여부 판단 (결재가 진행중일 때)
  const shouldShowApprovalStatusButton = () => {
    return approvalStatus !== 'NONE' && itemId;
  };

  // 수정 버튼 표시 여부 판단
  const shouldShowEditButton = () => {
    return approvalStatus === 'NONE';
  };

  // 저장 버튼 표시 여부 판단
  const shouldShowSaveButton = () => {
    return approvalStatus === 'NONE' && isEditMode;
  };


  // 공통코드 배열 추출 함수
  const getCodesArray = useCallback((): CommonCode[] => {
    if (!allCodes) return [];
    if (Array.isArray(allCodes)) {
      return allCodes;
    }
    if (typeof allCodes === 'object' && 'data' in allCodes && Array.isArray(allCodes.data)) {
      return allCodes.data;
    }
    return [];
  }, [allCodes]);

  // 항목구분 공통코드 가져오기
  const getFieldTypeCodes = useCallback(() => {
    const codes = getCodesArray();

    // 공통코드에서 FIELD_TYPE 필터링
    const filteredCodes = codes
      .filter(code => code.groupCode === 'FIELD_TYPE' && code.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder);

    // 필터링된 코드가 없으면 하드코딩된 기본값 반환
    if (filteredCodes.length === 0) {
      return [
        { code: 'CRT', codeName: '공통항목', groupCode: 'FIELD_TYPE', useYn: 'Y', sortOrder: 1 },
        { code: 'URT', codeName: '고유항목', groupCode: 'FIELD_TYPE', useYn: 'Y', sortOrder: 2 },
      ];
    }

    return filteredCodes;
  }, [getCodesArray]);

  // 공통코드 옵션 생성 함수
  const getCommonCodeOptions = useCallback(
    (groupCode: string): SelectOption[] => {
      const codes = getCodesArray();

      // 항목구분인 경우 별도 처리
      if (groupCode === 'FIELD_TYPE') {
        const fieldTypeCodes = getFieldTypeCodes();
        const options = fieldTypeCodes.map(code => ({
          value: code.code,
          label: code.codeName,
        }));
        return options;
      }

      // 주기(PERIOD) 코드 처리
      if (groupCode === 'PERIOD') {
        const filteredCodes = codes.filter(
          code => code.groupCode === groupCode && code.useYn === 'Y'
        );

        // 필터링된 코드가 없으면 하드코딩된 기본값 반환
        if (filteredCodes.length === 0) {
          return [
            { value: 'PRD01', label: '년' },
            { value: 'PRD02', label: '반기' },
            { value: 'PRD03', label: '분기' },
            { value: 'PRD04', label: '월' },
            { value: 'PRD05', label: '수시' },
          ];
        }

        const options = filteredCodes
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(code => ({
            value: code.code,
            label: code.codeName,
          }));

        return options;
      }

      // 점검시기(MONTH) 코드 처리
      if (groupCode === 'MONTH') {
        const filteredCodes = codes.filter(
          code => code.groupCode === groupCode && code.useYn === 'Y'
        );

        // 필터링된 코드가 없으면 하드코딩된 기본값 반환
        if (filteredCodes.length === 0) {
          return [
            { value: 'MON01', label: '1월' },
            { value: 'MON02', label: '2월' },
            { value: 'MON03', label: '3월' },
            { value: 'MON04', label: '4월' },
            { value: 'MON05', label: '5월' },
            { value: 'MON06', label: '6월' },
            { value: 'MON07', label: '7월' },
            { value: 'MON08', label: '8월' },
            { value: 'MON09', label: '9월' },
            { value: 'MON10', label: '10월' },
            { value: 'MON11', label: '11월' },
            { value: 'MON12', label: '12월' },
          ];
        }

        const options = filteredCodes
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(code => ({
            value: code.code,
            label: code.codeName,
          }));

        return options;
      }

      // 기타 공통코드 처리
      const filteredCodes = codes.filter(
        code => code.groupCode === groupCode && code.useYn === 'Y'
      );

      const options = filteredCodes
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(code => ({
          value: code.code,
          label: code.codeName,
        }));

      return options;
    },
    [getCodesArray, getFieldTypeCodes]
  );

  // 직무구분 옵션 - 항목구분에 따라 동적 변경
  const getRoleTypeOptions = useCallback((): SelectOption[] => {

    // 공통항목(CRT)인 경우
    if (formData.fieldTypeCd === 'CRT') {
      const options = getCommonCodeOptions('COM_ROLE_TYPE');

      // 옵션이 없으면 하드코딩된 기본값 반환
      if (options.length === 0) {
        return [
          { value: 'CRT01', label: '내부통제 공통(준법)' },
          { value: 'CRT02', label: '내부통제 공통(HR)' },
          { value: 'CRT03', label: '내부통제 공통(감사)' },
          { value: 'CRT03', label: '내부통제 공통(공시)' },
        ];
      }
      return options;
    }
    // 고유항목(URT)인 경우
    else if (formData.fieldTypeCd === 'URT') {
      const options = getCommonCodeOptions('UNI_ROLE_TYPE');

      // 옵션이 없으면 하드코딩된 기본값 반환
      if (options.length === 0) {
        return [
          { value: 'URT01', label: '부서고유' },
          { value: 'URT02', label: '부서별 (공통)' },
        ];
      }
      return options;
    }

    return [];
  }, [formData.fieldTypeCd, getCommonCodeOptions]);


  // 데이터 로드 함수
  const loadItemData = useCallback(async () => {
    if (!itemId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await hodICItemApi.getHodICItemById(itemId);
      setFormData({
        responsibilityId: data.responsibilityId,
        responsibilityContent: data.responsibilityContent || '',
        responsibilityDetailId: data.responsibilityDetailId || '',
        responsibilityDetailContent: data.responsibilityDetailContent || '',
        deptCd: data.deptCd,
        deptName: data.deptName || '', // API에서 부서명 가져오기
        ledgerOrders: data.ledgerOrders || 0,
        fieldTypeCd: data.fieldTypeCd,
        roleTypeCd: data.roleTypeCd,
        periodCd: data.periodCd,
        checkPeriod: data.checkPeriod,
        measureId: data.measureId || '',
        icTask: data.icTask,
        measureDesc: data.measureDesc,
        measureType: data.measureType,
        supportDoc: data.supportDoc,
        checkWay: data.checkWay,
      });

    } catch (err) {
      console.error('Failed to load item data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [itemId]);


  // 컴포넌트 마운트 시 localStorage에서 공통코드 복원
  useEffect(() => {
    const storedCommonCodes = localStorage.getItem('commonCodes');

    if (
      storedCommonCodes &&
      (!allCodes ||
        (Array.isArray(allCodes) && allCodes.length === 0) ||
        (typeof allCodes === 'object' &&
          'data' in allCodes &&
          (!allCodes.data || allCodes.data.length === 0)))
    ) {
      try {
        const parsedCodes = JSON.parse(storedCommonCodes);
        // 여기서 setAllCodes를 사용할 수 없으므로 Redux 액션을 통해 업데이트해야 함
      } catch (error) {
        console.error('localStorage 공통코드 복원 실패:', error);
        localStorage.removeItem('commonCodes');
      }
    }
  }, [allCodes]);

  // initialMode이 변경될 때 내부 mode 상태 업데이트
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // 다이얼로그가 열릴 때 모드 초기화
  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  // 데이터 로드
  useEffect(() => {
    if (open && itemId && (isEditMode || isViewMode)) {
      loadItemData();
    } else if (open && isCreateMode) {
      setFormData(initialFormData);
      setError(null);
    }
  }, [
    open,
    itemId,
    mode,
    isEditMode,
    isViewMode,
    isCreateMode,
    loadItemData,
  ]);

  // 항목구분 변경시 직무구분 초기화
  useEffect(() => {
    if (formData.fieldTypeCd) {
      const newRoleOptions = getRoleTypeOptions();
      // 현재 선택된 직무구분이 새로운 옵션에 없으면 초기화
      if (
        formData.roleTypeCd &&
        !newRoleOptions.some(option => option.value === formData.roleTypeCd)
      ) {
        setFormData(prev => ({ ...prev, roleTypeCd: '' }));
      }
    }
  }, [formData.fieldTypeCd, formData.roleTypeCd, getRoleTypeOptions]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };


  const validateForm = (): boolean => {
    if (!formData.responsibilityId) {
      setError('책무ID를 선택해주세요.');
      return false;
    }
    if (!formData.deptCd || !formData.deptCd.trim()) {
      setError('부서명을 선택해주세요.');
      return false;
    }
    if (!formData.fieldTypeCd || !formData.fieldTypeCd.trim()) {
      setError('항목구분을 선택해주세요.');
      return false;
    }
    if (!formData.roleTypeCd || !formData.roleTypeCd.trim()) {
      setError('직무구분을 선택해주세요.');
      return false;
    }
    if (!formData.icTask || !formData.icTask.trim()) {
      setError('내부통제업무를 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      // 1. HodICItem 데이터 저장
      const requestData: HodICItemCreateRequest = {
        responsibilityId: formData.responsibilityId as number,
        responsibilityDetailId: formData.responsibilityDetailId as number,
        ledgerOrders: formData.ledgerOrders,
        deptCd: formData.deptCd,
        fieldTypeCd: formData.fieldTypeCd,
        roleTypeCd: formData.roleTypeCd,
        icTask: formData.icTask,
        measureId: formData.measureId,
        measureDesc: formData.measureDesc,
        measureType: formData.measureType,
        periodCd: formData.periodCd,
        supportDoc: formData.supportDoc,
        checkPeriod: formData.checkPeriod,
        checkWay: formData.checkWay,
        proofDoc: '',
      };

      let savedItemId: number;
      if (isCreateMode) {
        savedItemId = await hodICItemApi.createHodICItem(requestData);
      } else if (isEditMode && itemId) {
        await hodICItemApi.updateHodICItem(itemId, requestData);
        savedItemId = itemId;
      } else {
        throw new Error('Invalid save mode');
      }


      // 저장 성공 시 view 모드로 변경
      setMode('view');
      onSuccess?.();
    } catch (err) {
      console.error('Failed to save item:', err);
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };


  // 책무 선택 핸들러
  const handleResponsibilitySelect = (responsibility: ResponsibilitySearchResult) => {
    setFormData(prev => ({
      ...prev,
      responsibilityId: responsibility.responsibilityId,
      responsibilityContent: responsibility.responsibilityContent,
    }));
    setResponsibilitySearchOpen(false);
  };

  // 부서 선택 핸들러
  const handleDepartmentSelect = (department: Department | Department[]) => {
    const dept = Array.isArray(department) ? department[0] : department;
    setFormData(prev => ({
      ...prev,
      deptCd: dept.deptCode,
      deptName: dept.deptName,
    }));
    setDepartmentSearchOpen(false);
  };

  // 책무상세 조회 API 함수
  const fetchResponsibilityDetails = async (responsibilityId: number): Promise<ResponsibilityDetail[]> => {
    const response = await apiClient.get<ResponsibilityDetail[]>(`/responsibilities/responsibility-details?responsibilityId=${responsibilityId}`);
    return response || [];
  };

  // 책무상세 조회 버튼 핸들러
  const handleResponsibilityDetailSearch = async () => {
    if (!formData.responsibilityId) {
      setError('먼저 책무ID를 선택해주세요.');
      return;
    }
    
    setDetailsLoading(true);
    setError(null);
    try {
      const details = await fetchResponsibilityDetails(formData.responsibilityId as number);
      setResponsibilityDetails(details);
      setResponsibilityDetailSearchOpen(true);
    } catch (err) {
      console.error('책무상세 조회 오류:', err);
      setError('책무상세 조회 중 오류가 발생했습니다.');
    } finally {
      setDetailsLoading(false);
    }
  };

  // 책무상세 선택 핸들러
  const handleResponsibilityDetailSelect = (detail: ResponsibilityDetail) => {
    setFormData(prev => ({
      ...prev,
      responsibilityDetailId: detail.responsibilityDetailId,
      responsibilityDetailContent: detail.responsibilityDetailContent,
    }));
    setResponsibilityDetailSearchOpen(false);
  };

  const handleClose = () => {
    if (saving) return;
    // 다이얼로그 닫을 때 모드 초기화
    setMode(initialMode);
    onClose();
  };

  const handleModeChange = (newMode: DialogMode) => {
    if (newMode === 'onlyRead') return; // onlyRead 모드는 지원하지 않음
    setMode(newMode as 'create' | 'edit' | 'view');
  };

  // 커스텀 액션 버튼들 생성
  const renderCustomActions = () => {
    const actions = [];

    // 결재 상신 버튼 (approvalStatus가 NONE이고 itemId가 있을 때)
    if (shouldShowApprovalButton() && itemId) {
      console.log('🔵 결재 상신 버튼 렌더링:', {
        taskType: 'hod_ic_item',
        taskId: itemId,
        taskIdType: typeof itemId,
        currentUserId,
        approvalStatus,
        loading,
        disabled: loading || !currentUserId
      });
      
      actions.push(
        <ApprovalActionButton
          key="approval-submit"
          taskType="hod_ic_item"
          taskId={itemId}
          taskTitle={`부서장 내부통제 항목 - ${formData.icTask || '항목명'}`}
          currentUserId={currentUserId || ''}
          onApprovalStateChange={() => {
            console.log('🔄 결재 상태 변경됨 - taskType: hod_ic_item, taskId:', itemId);
            onSuccess?.(); // 부모 컴포넌트에 상태 변경 알림
          }}
          size="medium"
          variant="contained"
          disabled={loading || !currentUserId}
        />
      );
    }

    // 결재현황 버튼 (approvalStatus가 NONE이 아니고 itemId가 있을 때 - 결재가 진행중)
    if (shouldShowApprovalStatusButton() && itemId) {
      console.log('🔍 결재현황 버튼 렌더링:', {
        taskType: 'hod_ic_item',
        taskId: itemId,
        approvalStatus,
        currentUserId
      });
      
      actions.push(
        <ApprovalActionButton
          key="approval-status"
          taskType="hod_ic_item"
          taskId={itemId}
          taskTitle={`부서장 내부통제 항목 - ${formData.icTask || '항목명'}`}
          currentUserId={currentUserId || ''}
          onApprovalStateChange={() => {
            console.log('🔄 결재 상태 변경됨 - taskType: hod_ic_item, taskId:', itemId);
            onSuccess?.(); // 부모 컴포넌트에 상태 변경 알림
          }}
          size="medium"
          variant="outlined"
          disabled={loading || !currentUserId}
        />
      );
    }

    // 수정 버튼 (결재상태가 NONE일 때)
    if (shouldShowEditButton() && isViewMode) {
      actions.push(
        <Button
          key="edit-button"
          variant="contained"
          onClick={() => handleModeChange('edit')}
          disabled={loading}
          color="warning"
          size="medium"
          sx={{
            height: '36px !important',
            minWidth: '80px !important',
            fontSize: '0.875rem !important',
            fontWeight: '600 !important',
            borderRadius: '4px !important',
          }}
        >
          수정
        </Button>
      );
    }

    // 저장 버튼 (edit 모드이면서 결재상태가 NONE일 때)
    if (shouldShowSaveButton()) {
      actions.push(
        <Button
          key="save-button"
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading}
          color="success"
          size="medium"
          sx={{
            height: '36px !important',
            minWidth: '80px !important',
            fontSize: '0.875rem !important',
            fontWeight: '600 !important',
            borderRadius: '4px !important',
          }}
        >
          저장
        </Button>
      );
    }

    // 취소/닫기 버튼
    actions.push(
      <Button
        key="close-button"
        variant="outlined"
        onClick={() => {
          if (isEditMode) {
            // 취소 버튼: edit 모드에서 view 모드로 변경
            setMode('view');
          } else {
            // 닫기 버튼: 다이얼로그 닫기
            handleClose();
          }
        }}
        disabled={loading}
        color="primary"
        size="medium"
        style={{
          height: '36px',
          minWidth: '80px',
          fontSize: '0.875rem',
          fontWeight: 600,
          borderRadius: '4px',
        }}
        sx={{
          height: '36px !important',
          minWidth: '80px !important',
          fontSize: '0.875rem !important',
          fontWeight: '600 !important',
          borderRadius: '4px !important',
        }}
      >
        {isEditMode ? '취소' : '닫기'}
      </Button>
    );

    return (
      <Box sx={{ 
        display: 'flex', 
        gap: 1,
        alignItems: 'center',
        '& .MuiButton-root': {
          height: '36px !important',
          minWidth: '80px !important',
          fontSize: '0.875rem !important',
          fontWeight: '600 !important',
          borderRadius: '4px !important',
        },
        // ButtonGroup 내부 버튼들도 통일
        '& .MuiButtonGroup-root .MuiButton-root': {
          height: '36px !important',
          minWidth: '80px !important',
          fontSize: '0.875rem !important',
          fontWeight: '600 !important',
          borderRadius: '4px !important',
        },
        // ButtonGroup 전체 스타일
        '& .MuiButtonGroup-root': {
          '& .MuiButton-root:first-of-type': {
            borderTopRightRadius: '0 !important',
            borderBottomRightRadius: '0 !important',
          },
          '& .MuiButton-root:last-of-type': {
            borderTopLeftRadius: '0 !important',
            borderBottomLeftRadius: '0 !important',
          },
        },
      }}>
        {actions}
      </Box>
    );
  };

  return (
    <>
      <BaseDialog
        open={open}
        onClose={handleClose}
        onSave={handleSave}
        onModeChange={handleModeChange}
        maxWidth='md'
        mode={mode}
        title={mode === 'create' ? '내부통제항목 등록' : mode === 'edit' ? '내부통제항목 수정' : '내부통제항목 조회'}
        customActions={renderCustomActions()}
      >

        <DialogContent sx={{ 
          p: 3,
          // view 모드에서 텍스트 스타일 진하게 통일
          ...(isViewMode && {
            // 모든 비활성화된 입력 필드의 텍스트 색상 강제 변경
            '& .MuiInputBase-input[disabled]': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            '& .MuiInputBase-input.Mui-disabled': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            // TextField 전체 스타일
            '& .MuiTextField-root .MuiInputBase-input': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            // Select 비활성화 상태 스타일
            '& .MuiSelect-select.Mui-disabled': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            '& .MuiSelect-select[disabled]': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            // 멀티라인 텍스트 영역
            '& .MuiInputBase-inputMultiline[disabled]': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            '& .MuiInputBase-inputMultiline.Mui-disabled': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            // 라벨 스타일
            '& .MuiInputLabel-root.Mui-disabled': {
              color: '#666 !important',
              opacity: '1 !important',
            },
            // 헬퍼 텍스트 스타일
            '& .MuiFormHelperText-root': {
              color: '#999 !important',
              opacity: '1 !important',
            },
            // OutlinedInput 스타일
            '& .MuiOutlinedInput-input[disabled]': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            }
          })
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={2}>
                {/* 책무ID */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label='책무ID *'
                      value={formData.responsibilityContent || `${formData.responsibilityId}`}
                      disabled
                      placeholder='책무를 선택하세요'
                      helperText={
                        formData.responsibilityId ? `책무ID: ${formData.responsibilityId}` : ''
                      }
                    />
                    {!isViewMode && (
                      <Button
                        variant='outlined'
                        onClick={() => setResponsibilitySearchOpen(true)}
                        sx={{ minWidth: 100 }}
                        startIcon={<SearchIcon />}
                      >
                        조회
                      </Button>
                    )}
                  </Box>
                </Grid>

                {/* 책무상세ID */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label='책무상세ID *'
                      value={formData.responsibilityDetailContent || `${formData.responsibilityDetailId}`}
                      disabled
                      placeholder='책무상세를 선택하세요'
                      helperText={
                        formData.responsibilityDetailId ? `책무상세ID: ${formData.responsibilityDetailId}` : ''
                      }
                    />
                    {!isViewMode && (
                      <Button
                        variant='outlined'
                        onClick={handleResponsibilityDetailSearch}
                        sx={{ minWidth: 100 }}
                        startIcon={<SearchIcon />}
                      >
                        조회
                      </Button>
                    )}
                  </Box>
                </Grid>

                {/* 부서명 */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label='부서명 *'
                      value={formData.deptName}
                      disabled
                      placeholder='부서를 선택하세요'
                      helperText={formData.deptCd ? `부서코드: ${formData.deptCd}` : ''}
                    />
                    {!isViewMode && (
                      <Button
                        variant='outlined'
                        onClick={() => setDepartmentSearchOpen(true)}
                        sx={{ minWidth: 100 }}
                        startIcon={<SearchIcon />}
                      >
                        조회
                      </Button>
                    )}
                  </Box>
                </Grid>

                

                {/* 책무번호 */}
                <Grid item xs={12} sm={6}>
                  <LedgerOrdersHodSelect
                    value={formData.ledgerOrders.toString()}
                    onChange={(value) => handleInputChange('ledgerOrders', Number(value))}
                    disabled={isViewMode}
                    includeAll={false}
                    placeholder="부서장 책무번호 선택 *"
                    size="medium"
                    sx={{ width: '100%' }}
                    minWidth="100%"
                    maxWidth="100%"
                  />
                </Grid>

                {/* 항목구분 */}
                <Grid item xs={12} sm={6}>
                  <Select
                    value={formData.fieldTypeCd}
                    label='항목구분 *'
                    options={[
                      { value: '', label: '선택하세요' },
                      ...getFieldTypeCodes().map(code => ({
                        value: code.code,
                        label: code.codeName,
                      }))
                    ]}
                    onChange={(value) => handleInputChange('fieldTypeCd', value as string)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 직무구분 */}
                <Grid item xs={12} sm={6}>
                  <Select
                    value={formData.roleTypeCd}
                    label='직무구분 *'
                    options={[
                      { value: '', label: '선택하세요' },
                      ...getRoleTypeOptions()
                    ]}
                    onChange={(value) => handleInputChange('roleTypeCd', value as string)}
                    disabled={isViewMode || !formData.fieldTypeCd}
                  />
                </Grid>

                {/* 조치활동ID */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='조치활동ID'
                    value={formData.measureId}
                    onChange={e => handleInputChange('measureId', e.target.value)}
                    disabled={isViewMode}
                  />
                </Grid>

                

                {/* 조치활동 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='조치활동'
                    value={formData.measureDesc}
                    onChange={e => handleInputChange('measureDesc', e.target.value)}
                    disabled={isViewMode}
                    multiline
                    rows={2}
                  />
                </Grid>

                {/* 내부통제업무 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='내부통제업무 *'
                    value={formData.icTask}
                    onChange={e => handleInputChange('icTask', e.target.value)}
                    disabled={isViewMode}
                    multiline
                    rows={3}
                  />
                </Grid>

                {/* 조치유형 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='조치유형'
                    value={formData.measureType}
                    onChange={e => handleInputChange('measureType', e.target.value)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 주기 */}
                <Grid item xs={12} sm={6}>
                  <Select
                    value={formData.periodCd}
                    label='주기'
                    options={[
                      { value: '', label: '선택하세요' },
                      ...getCommonCodeOptions('PERIOD')
                    ]}
                    onChange={(value) => handleInputChange('periodCd', value as string)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 점검시기 */}
                <Grid item xs={12} sm={6}>
                  <Select
                    value={formData.checkPeriod}
                    label='점검시기'
                    options={[
                      { value: '', label: '선택하세요' },
                      ...getCommonCodeOptions('MONTH')
                    ]}
                    onChange={(value) => handleInputChange('checkPeriod', value as string)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 관련근거 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='관련근거'
                    value={formData.supportDoc}
                    onChange={e => handleInputChange('supportDoc', e.target.value)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 점검방법 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='점검방법'
                    value={formData.checkWay}
                    onChange={e => handleInputChange('checkWay', e.target.value)}
                    disabled={isViewMode}
                    multiline
                    rows={2}
                  />
                </Grid>

              </Grid>
            </>
          )}
        </DialogContent>

      </BaseDialog>

      {/* 책무 조회 팝업 */}
      <ResponsibilitySearchPopup
        open={responsibilitySearchOpen}
        onClose={() => setResponsibilitySearchOpen(false)}
        onSelect={handleResponsibilitySelect}
        title='책무 조회'
      />

      {/* 부서 조회 팝업 */}
      <DepartmentSearchPopup
        open={departmentSearchOpen}
        onClose={() => setDepartmentSearchOpen(false)}
        onSelect={handleDepartmentSelect}
        title='부서 조회'
        multiSelect={false}
      />

      {/* 책무상세 조회 팝업 */}
      <Dialog
        open={responsibilityDetailSearchOpen}
        onClose={() => setResponsibilityDetailSearchOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          책무상세 조회
          <Button
            onClick={() => setResponsibilityDetailSearchOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : responsibilityDetails.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Alert severity="info">
                해당 책무에 대한 상세 정보가 없습니다.
              </Alert>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>책무상세ID</TableCell>
                    <TableCell>책무상세내용</TableCell>
                    <TableCell>책무관련근거</TableCell>
                    <TableCell>선택</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {responsibilityDetails.map((detail) => (
                    <TableRow 
                      key={detail.responsibilityDetailId}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleResponsibilityDetailSelect(detail)}
                    >
                      <TableCell>{detail.responsibilityDetailId}</TableCell>
                      <TableCell>{detail.responsibilityDetailContent}</TableCell>
                      <TableCell>{detail.responsibilityRelEvid}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResponsibilityDetailSelect(detail);
                          }}
                        >
                          선택
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HodICItemDialog;
