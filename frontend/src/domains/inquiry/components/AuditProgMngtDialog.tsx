/**
 * 점검 계획 관리 다이얼로그
 * 
 * 단일 책임 원칙(SRP): 점검 계획의 CRUD 작업만을 담당
 * 개방-폐쇄 원칙(OCP): 새로운 필드 추가 시 기존 코드 수정 없이 확장 가능
 * 리스코프 치환 원칙(LSP): BaseDialog의 인터페이스를 준수
 * 인터페이스 분리 원칙(ISP): 각 기능별로 명확한 인터페이스 분리
 * 의존성 역전 원칙(DIP): 구체적인 구현이 아닌 추상화에 의존
 */

import type { DialogMode } from '@/shared/components/modal/BaseDialog';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import DatePicker from '@/shared/components/ui/form/DatePicker';
import TextField from '@/shared/components/ui/data-display/TextField';
import LedgerOrdersHodSelect from '@/shared/components/ui/form/LedgerOrdersHodSelect';
import { Box, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import InspectionTargetSelectionDialog, { type InspectionTargetItem } from './InspectionTargetSelectionDialog';

/**
 * 점검 계획 등록/수정 데이터 인터페이스
 * 
 * 책임: 점검 계획 데이터 구조 정의
 * 확장성: 새로운 필드 추가 시 기존 코드 영향 최소화
 */
export interface AuditProgramData {
  id?: number;                    // 점검 계획 ID (수정/조회 시 사용)
  planCode: string;              // 점검계획 코드 (필수)
  ledgerOrdersHod: string;       // 책무번호
  auditTitle: string;            // 점검 회차명 (backend auditTitle 필드와 매핑)
  startDate: Date | null;        // 점검 시작일
  endDate: Date | null;          // 점검 종료일
  targetSelection: string;       // 점검 대상 선정 정보
  remarks: string;               // 비고
  targetItems?: InspectionTargetItem[]; // 선택된 점검 대상 항목들
  targetItemIds?: number[];      // 선택된 점검 대상 항목 ID 목록 (backend 전송용)
  targetItemData?: Array<{       // 선택된 점검 대상 상세 정보 (backend 전송용)
    hodIcItemId: number;
    responsibilityId: number;
    responsibilityDetailId: number;
  }>;
}

/**
 * 점검 계획 다이얼로그 Props 인터페이스
 * 
 * 인터페이스 분리 원칙: 필요한 기능만 노출
 */
interface AuditProgMngtDialogProps {
  open: boolean;
  mode: DialogMode;
  onClose: () => void;
  onSave: (data: AuditProgramData) => Promise<void>;
  onModeChange: (mode: DialogMode) => void;
  loading: boolean;
  initialData?: AuditProgramData | null;
  onTargetSelection?: (formData: AuditProgramData) => void; // 점검 대상 선정 버튼 클릭 핸들러
  selectedTargetItems?: InspectionTargetItem[]; // 선택된 점검 대상 항목
}

/**
 * 점검계획 코드 자동 생성 함수
 * 
 * 형식: AUDIT-YYYYMMDD-HHMMSS
 */
const generatePlanCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `AUDIT-${year}${month}${day}-${hours}${minutes}${seconds}`;
};

/**
 * 기본 점검 계획 데이터 생성 함수
 * 
 * 단일 책임: 초기 데이터 생성만 담당
 */
const createDefaultAuditProgramData = (): AuditProgramData => ({
  planCode: generatePlanCode(),
  ledgerOrdersHod: '',
  auditTitle: '',
  startDate: new Date(),
  endDate: new Date(),
  targetSelection: '',
  remarks: '',
  targetItemIds: [],
  targetItemData: [],
});

/**
 * 폼 유효성 검증 인터페이스
 * 
 * 책임: 유효성 검증 결과 구조 정의
 */
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * 폼 유효성 검증 훅
 * 
 * 단일 책임: 점검 계획 데이터 유효성 검증만 담당
 * 재사용성: 다른 컴포넌트에서도 사용 가능
 */
const useFormValidation = (data: AuditProgramData): ValidationResult => {
  const validate = useCallback((): ValidationResult => {
    const errors: Record<string, string> = {};

    // 점검계획 코드 필수 검증
    if (!data.planCode || (typeof data.planCode === 'string' && !data.planCode.trim())) {
      errors.planCode = '점검계획 코드는 필수 입력 항목입니다.';
    }

    // 책무번호 필수 검증
    if (!data.ledgerOrdersHod || (typeof data.ledgerOrdersHod === 'string' && !data.ledgerOrdersHod.trim())) {
      errors.ledgerOrdersHod = '책무번호는 필수 선택 항목입니다.';
    }

    // 점검 회차명 필수 검증
    if (!data.auditTitle || (typeof data.auditTitle === 'string' && !data.auditTitle.trim())) {
      errors.auditTitle = '점검 회차명은 필수 입력 항목입니다.';
    }

    // 점검 기간 유효성 검증
    if (!data.startDate) {
      errors.startDate = '점검 시작일은 필수 입력 항목입니다.';
    }

    if (!data.endDate) {
      errors.endDate = '점검 종료일은 필수 입력 항목입니다.';
    }

    // 시작일이 종료일보다 늦은 경우
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      errors.endDate = '종료일은 시작일보다 늦어야 합니다.';
    }

    // 점검 대상 항목 필수 검증
    if (!data.targetItemIds || data.targetItemIds.length === 0) {
      errors.targetSelection = '점검 대상 항목을 선정해주세요.';
    }
    console.log("errors", errors);
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [data]);

  return validate();
};

/**
 * 점검 계획 관리 다이얼로그 컴포넌트
 * 
 * 주요 책임:
 * - 점검 계획 데이터의 등록/수정/조회 UI 제공
 * - 사용자 입력 데이터 관리 및 유효성 검증
 * - 부모 컴포넌트와의 데이터 통신
 */
const AuditProgMngtDialog: React.FC<AuditProgMngtDialogProps> = ({
  open,
  mode,
  onClose,
  onSave,
  onModeChange,
  loading,
  initialData,
  onTargetSelection,
  selectedTargetItems,
}) => {
  // 점검 계획 데이터 상태 관리
  const [formData, setFormData] = useState<AuditProgramData>(
    initialData || createDefaultAuditProgramData()
  );

  // 점검 대상 선정 팝업 상태
  const [targetSelectionOpen, setTargetSelectionOpen] = useState(false);
  const [targetSelectionKey, setTargetSelectionKey] = useState<string>('initial');

  // 폼 유효성 검증
  const validation = useFormValidation(formData);

  // 초기 로드 여부를 추적하는 ref
  const isInitialLoadRef = useRef(true);

  /**
   * 초기 데이터 설정
   * 
   * 책임: 모드 변경 시 적절한 초기 데이터 설정
   */
  useEffect(() => {
    if (mode === 'create') {
      // 새로운 점검계획 코드를 생성하여 설정
      setFormData(createDefaultAuditProgramData());
      isInitialLoadRef.current = false;
    } else if (initialData && isInitialLoadRef.current) {
      // 처음 로드시에만 initialData를 설정
      setFormData({ ...initialData });
      isInitialLoadRef.current = false;
    }
  }, [mode, initialData]);

  // 다이얼로그가 열릴 때마다 초기 로드 플래그 리셋
  useEffect(() => {
    if (open) {
      isInitialLoadRef.current = true;
    }
  }, [open]);

  /**
   * 선택된 타겟 항목 업데이트
   * 사용자가 입력한 다른 필드들은 보존하면서 점검대상 관련 필드만 업데이트
   */
  useEffect(() => {
    if (selectedTargetItems && selectedTargetItems.length > 0) {
      setFormData(prev => {
        // 현재 사용자가 입력한 중요한 데이터들을 명시적으로 보존
        const preservedData = {
          planCode: prev.planCode,
          ledgerOrdersHod: prev.ledgerOrdersHod,
          auditTitle: prev.auditTitle, // 회차명 보존
          startDate: prev.startDate,
          endDate: prev.endDate,
          remarks: prev.remarks, // 비고 보존
        };

        return {
          ...prev,
          ...preservedData, // 보존할 데이터를 명시적으로 덮어쓰기
          targetItems: selectedTargetItems,
          targetItemIds: selectedTargetItems.map(item => item.id),
          targetItemData: selectedTargetItems.map(item => ({
            hodIcItemId: item.id,
            responsibilityId: item.responsibilityId,
            responsibilityDetailId: item.responsibilityDetailId
          })),
          targetSelection: `${selectedTargetItems.length}개 항목 선정됨`
        };
      });
    }
  }, [selectedTargetItems]);

  /**
   * 입력 필드 변경 핸들러
   * 
   * 단일 책임: 텍스트 입력 필드 값 업데이트
   */
  const handleInputChange = useCallback((
    field: keyof AuditProgramData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * 날짜 필드 변경 핸들러
   * 
   * 단일 책임: 날짜 입력 필드 값 업데이트
   * 추가 로직: 시작일 변경 시 종료일 자동 조정
   */
  const handleDateChange = useCallback((
    field: keyof AuditProgramData,
    date: Date | null
  ) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: date };

      // 시작일 변경 시 종료일이 더 이전이면 종료일을 시작일로 맞춤
      if (field === 'startDate' && date && prev.endDate && date > prev.endDate) {
        newData.endDate = date;
      }

      return newData;
    });
  }, []);

  /**
   * 저장 핸들러
   * 
   * 책임: 폼 유효성 검증 후 상위 컴포넌트에 저장 요청
   */
  const handleSave = useCallback(async () => {
    if (!validation.isValid) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('점검 계획 저장 중 오류 발생:', error);
    }
  }, [formData, validation.isValid, onSave]);

  /**
   * 점검 대상 선정 핸들러
   * 
   * 책임: 점검 대상 선정 팝업 호출
   */
  const handleTargetSelection = useCallback(() => {
    if (onTargetSelection) {
      // 부모 컴포넌트에서 팝업을 관리하는 경우
      onTargetSelection(formData);
    } else {
      // 자체적으로 팝업을 관리하는 경우
      // 팝업이 열릴 때마다 이전 선택 초기화
      setFormData(prev => ({
        ...prev,
        targetItems: [],
        targetItemIds: [],
        targetItemData: [],
        targetSelection: ''
      }));

      // 팝업 강제 리렌더링을 위한 고유 키 생성
      setTargetSelectionKey(`target-${Date.now()}`);

      setTargetSelectionOpen(true);
    }
  }, [onTargetSelection, formData]);

  /**
   * 점검 대상 선정 완료 핸들러
   */
  const handleTargetSelectionComplete = useCallback((selectedItems: InspectionTargetItem[]) => {
    // 선택된 항목들을 formData에 저장
    setFormData(prev => ({
      ...prev,
      targetItems: selectedItems,
      targetItemIds: selectedItems.map(item => item.id),
      targetItemData: selectedItems.map(item => ({
        hodIcItemId: item.id,
        responsibilityId: item.responsibilityId,
        responsibilityDetailId: item.responsibilityDetailId
      })),
      targetSelection: `${selectedItems.length}개 항목 선정됨`
    }));
    setTargetSelectionOpen(false);
  }, []);

  return (
    <BaseDialog
      open={open}
      mode={mode}
      onClose={onClose}
      onSave={handleSave}
      onModeChange={onModeChange}
      title={
        mode === 'create' ? '점검 계획 등록' :
          mode === 'edit' ? '점검 계획 수정' :
            '점검 계획 상세'
      }
      loading={loading}
      disableSave={!validation.isValid}
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: '480px' }}>
        {/* 점검계획 코드 */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            required
            label="점검계획 코드"
            value={formData.planCode}
            onChange={e => handleInputChange('planCode', e.target.value)}
            error={!!validation.errors.planCode}
            helperText={validation.errors.planCode || '자동 생성된 점검계획 코드입니다'}
            placeholder="자동 생성됨"
            InputProps={{
              readOnly: true,
            }}
            sx={{
              flex: 1,
              '& .MuiInputBase-input': {
                backgroundColor: '#f5f5f5',
                fontWeight: 600,
              }
            }}
          />
        </Box>

        {/* 책무번호 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'var(--bank-text-primary)'
            }}
          >
            책무번호
          </Typography>
          <LedgerOrdersHodSelect
            value={formData.ledgerOrdersHod}
            onChange={(value) => handleInputChange('ledgerOrdersHod', value)}
            size="small"
            includeAll={false}
            placeholder="책무번호를 선택하세요"
            disabled={mode === 'view'}
            sx={{ width: '100%' }}
          />
        </Box>

        {/* 점검 회차명 */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            mode={mode === 'view' ? 'readonly' : 'editable'}
            required
            label="점검 회차명"
            value={formData.auditTitle}
            onChange={e => handleInputChange('auditTitle', e.target.value)}
            error={!!validation.errors.auditTitle}
            helperText={validation.errors.auditTitle || '점검 회차명을 입력하세요'}
            placeholder="점검 회차명을 입력하세요"
            disabled={mode === 'view'}
            sx={{ flex: 1 }}
          />
        </Box>

        {/* 점검 기간 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'var(--bank-text-primary)',
              '&::after': {
                content: '" *"',
                color: 'red'
              }
            }}
          >
            점검 기간
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
              value={formData.startDate}
              onChange={date => handleDateChange('startDate', date)}
              size="small"
              sx={{ flex: 1 }}
              label="시작일"
              error={!!validation.errors.startDate}
              helperText={validation.errors.startDate}
              mode={mode === 'view' ? 'readonly' : 'editable'}
              maxDate={formData.endDate ?? undefined}
            />
            <Typography sx={{ color: 'var(--bank-text-primary)', fontWeight: 600 }}>
              ~
            </Typography>
            <DatePicker
              value={formData.endDate}
              onChange={date => handleDateChange('endDate', date)}
              size="small"
              sx={{ flex: 1 }}
              label="종료일"
              error={!!validation.errors.endDate}
              helperText={validation.errors.endDate}
              mode={mode === 'view' ? 'readonly' : 'editable'}
              minDate={formData.startDate ?? undefined}
            />
          </Box>
        </Box>

        {/* 점검 대상 선정 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'var(--bank-text-primary)',
              '&::after': {
                content: '" *"',
                color: 'red'
              }
            }}
          >
            점검 대상 선정
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              required
              label="선정된 점검 대상"
              value={formData.targetSelection}
              onChange={e => handleInputChange('targetSelection', e.target.value)}
              placeholder="점검 대상을 선정하세요"
              mode="readonly"
              error={!!validation.errors.targetSelection}
              helperText={validation.errors.targetSelection || '점검 대상 항목을 선정해주세요'}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleTargetSelection}
              disabled={mode === 'view' || loading}
              color="primary"
              sx={{ minWidth: '120px' }}
            >
              선정
            </Button>
          </Box>
        </Box>

        {/* 비고 */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            mode={mode === 'view' ? 'readonly' : 'editable'}
            label="비고"
            value={formData.remarks}
            onChange={e => handleInputChange('remarks', e.target.value)}
            placeholder="비고사항을 입력하세요"
            disabled={mode === 'view'}
            multiline
            rows={3}
            sx={{ flex: 1 }}
          />
        </Box>
      </Box>

      {/* 점검 대상 선정 다이얼로그 */}
      {!onTargetSelection && (
        <InspectionTargetSelectionDialog
          key={targetSelectionKey}
          open={targetSelectionOpen}
          onClose={() => setTargetSelectionOpen(false)}
          onSelect={handleTargetSelectionComplete}
          ledgerOrdersHod={formData.ledgerOrdersHod}
        />
      )}
    </BaseDialog>
  );
};

export default AuditProgMngtDialog; 