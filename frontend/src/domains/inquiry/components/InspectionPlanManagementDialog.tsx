import type { DialogMode } from '@/shared/components/modal/BaseDialog';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import ComboBox from '@/shared/components/ui/form/ComboBox';
import DatePicker from '@/shared/components/ui/form/DatePicker';
import type { SelectOption } from '@/shared/types/common';
import { Box,  TextField, Typography } from '@mui/material';
import React from 'react';
import { Button } from '@/shared/components/ui/button';

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
  mode?: DialogMode; // 기본값 'create'로 처리
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  registrationData: RegistrationData;
  setRegistrationData: React.Dispatch<React.SetStateAction<RegistrationData>>;
  inspectionTargetOptions: SelectOption[];
}

const InspectionPlanManagementDialog: React.FC<InspectionPlanManagementDialogProps> = ({
  open,
  mode = 'create',
  onClose,
  onSubmit,
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
      setRegistrationData(prev => ({ ...prev, [field]: date }));
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };

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
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [registrationData]);

  // onSubmit 전에 validateForm을 호출하도록 부모에서 연결 필요

  return (
    <BaseDialog
      open={open}
      mode={mode}
      onClose={onClose}
      title="점검 계획 등록"
      loading={loading}
      customActions={
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="contained" size="small" onClick={onSubmit} color="primary" disabled={loading}>
            등록
          </Button>
          <Button variant="outlined" size="small" onClick={onClose} disabled={loading}>
            취소
          </Button>
        </Box>
      }
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
          />
          <Typography>~</Typography>
          <DatePicker
            value={registrationData.inspectionEndDate}
            onChange={date => handleDateChange('inspectionEndDate', date)}
            size="small"
            sx={{ flex: 1 }}
            label="종료일"
            error={!!validationErrors.inspectionEndDate}
            helperText={validationErrors.inspectionEndDate ? '필수' : ''}
          />
        </Box>

        <Button variant="contained" size="small"
        onClick={() => {
          console.log('점검 대상 선정');
        }}
        color="primary" disabled={loading}
         sx={{ width: '15%' }}>
          점검 대상 선정
        </Button>

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
        />
      </Box>
    </BaseDialog>
  );
};

export default InspectionPlanManagementDialog;
