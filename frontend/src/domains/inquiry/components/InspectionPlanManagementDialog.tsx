import type { DialogMode } from '@/shared/components/modal/BaseDialog';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import DatePicker from '@/shared/components/ui/form/DatePicker';
import type { SelectOption } from '@/shared/types/common';
import { Box, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import TextField from '@/shared/components/ui/data-display/textfield';
export interface RegistrationData {
  planCode: string;
  roundName: string;
  inspectionStartDate: Date;
  inspectionEndDate: Date;
  inspectionTarget: SelectOption | null;
  remarks: string;
}

interface InspectionPlanManagementDialogProps {
  open: boolean;
  mode: DialogMode; // 필수
  onClose: () => void;
  onSave: () => void;
  onModeChange: (mode: DialogMode) => void;
  loading: boolean;
  registrationData: RegistrationData;
  setRegistrationData: React.Dispatch<React.SetStateAction<RegistrationData>>;
  inspectionTargetOptions: SelectOption[];
}

const InspectionPlanManagementDialog: React.FC<InspectionPlanManagementDialogProps> = ({
  open,
  mode,
  onClose,
  onSave,
  onModeChange,
  loading,
  registrationData,
  setRegistrationData,
  inspectionTargetOptions,
}) => {
  // 필수 입력 검증 상태
  const [validationErrors, setValidationErrors] = React.useState<Record<string, boolean>>({});

  // 입력 핸들러
  const handleTextFieldChange = (
    field: keyof RegistrationData,
    value: string
  ) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
    if (value) setValidationErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleDateChange = (
    field: keyof RegistrationData,
    date: Date | null
  ) => {
    if (date) {
      setRegistrationData(prev => {
        // 시작일 변경 시 종료일이 더 이전이면 종료일을 시작일로 맞춤
        if (field === 'inspectionStartDate') {
          const newEndDate = prev.inspectionEndDate && date > prev.inspectionEndDate ? date : prev.inspectionEndDate;
          return { ...prev, inspectionStartDate: date, inspectionEndDate: newEndDate };
        }
        return { ...prev, [field]: date };
      });
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };
  useEffect(() => {
    if (mode === 'create') {
      setRegistrationData({
        planCode: '',
        roundName: '',
        inspectionStartDate: new Date(),
        inspectionEndDate: new Date(),
        inspectionTarget: null,
        remarks: '',
      });
    }
  }, [mode]);
  const handleComboBoxChange = (
    field: keyof RegistrationData,
    value: SelectOption | null
  ) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
    if (value) setValidationErrors(prev => ({ ...prev, [field]: false }));
  };

  // 폼 유효성 검사
  const validateForm = React.useCallback((): boolean => {
    const errors: Record<string, boolean> = {};
    if (!registrationData.roundName?.trim()) errors.roundName = true;
    if (!registrationData.inspectionStartDate) errors.inspectionStartDate = true;
    if (!registrationData.inspectionEndDate) errors.inspectionEndDate = true;
    if (!registrationData.inspectionTarget) errors.inspectionTarget = true;
    // 시작일 > 종료일인 경우 에러
    if (
      registrationData.inspectionStartDate &&
      registrationData.inspectionEndDate &&
      registrationData.inspectionStartDate > registrationData.inspectionEndDate
    ) {
      errors.inspectionEndDate = true;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [registrationData]);

  // onSave에서 validateForm을 호출하도록 부모에서 연결 필요

  return (
    <BaseDialog
      open={open}
      mode={mode}
      onClose={onClose}
      onSave={onSave}
      onModeChange={onModeChange}
      title={mode === 'create' ? '점검 계획 등록' : mode === 'edit' ? '점검 계획 수정' : '점검 계획 상세'}
      loading={loading}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 점검 회차 */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            required
            label="점검 회차"
            value={registrationData.roundName}
            onChange={e => handleTextFieldChange('roundName', e.target.value)}
            error={!!validationErrors.roundName}
            helperText={validationErrors.roundName ? '필수 입력 항목입니다.' : ''}
            placeholder="점검 회차를 입력하세요"
            disabled={mode === 'view'}
          />
        </Box>

        {/* 점검 기간 */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <DatePicker
            value={registrationData.inspectionStartDate}
            onChange={date => handleDateChange('inspectionStartDate', date)}
            size="small"
            sx={{ flex: 1 }}
            label="시작일"
            error={!!validationErrors.inspectionStartDate}
            helperText={validationErrors.inspectionStartDate ? '필수' : ''}
            disabled={mode === 'view'}
          />
          <Typography>~</Typography>
          <DatePicker
            value={registrationData.inspectionEndDate}
            onChange={date => handleDateChange('inspectionEndDate', date)}
            size="small"
            sx={{ flex: 1 }}
            label="종료일"
            minDate={registrationData.inspectionStartDate}
            error={!!validationErrors.inspectionEndDate}
            helperText={validationErrors.inspectionEndDate ? '필수' : ''}
            disabled={mode === 'view'}
          />
        </Box>
        {/* 비고 */}
        <TextField
          fullWidth
          label="비고"
          value={registrationData.remarks}
          onChange={e => handleTextFieldChange('remarks', e.target.value)}
          size="small"
          multiline
          rows={3}
          placeholder="비고를 입력하세요"
          disabled={mode === 'view'}
        />
      </Box>
    </BaseDialog>
  );
};

export default InspectionPlanManagementDialog;
