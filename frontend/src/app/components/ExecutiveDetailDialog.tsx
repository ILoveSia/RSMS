import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import Alert from '@/shared/components/modal/Alert';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface ExecutiveDetailDialogProps {
  open: boolean;
  onClose: () => void;
  executive: any | null;
  onSave: (data: any) => void;
}

const ExecutiveDetailDialog: React.FC<ExecutiveDetailDialogProps> = ({
  open,
  onClose,
  executive,
  onSave,
}) => {
  const [mode, setMode] = useState<DialogMode>('view');
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes } = useReduxState<{ data: CommonCode[] } | CommonCode[]>('codeStore/allCodes');

  // 공통코드 배열 추출 함수
  const getCodesArray = (): CommonCode[] => {
    if (!allCodes) return [];
    if (Array.isArray(allCodes)) return allCodes;
    if ('data' in allCodes && Array.isArray(allCodes.data)) return allCodes.data;
    return [];
  };

  // 공통코드 헬퍼 함수
  const getPositionCodes = () => {
    const codes = getCodesArray();
    return codes
      .filter(code => code.groupCode === 'POSITION' && code.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getJobTitleCodes = () => {
    const codes = getCodesArray();
    return codes
      .filter(code => code.groupCode === 'JOB_TITLE' && code.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  useEffect(() => {
    if (executive && open) {
      setFormData(executive);
    } else {
      setFormData({});
    }
    setError(null);
  }, [executive, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('임원 정보 저장 실패:', err);
      setError('임원 정보 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return !!(
      formData.positionName &&
      formData.executiveName &&
      formData.jobTitle &&
      formData.appointmentDate
    );
  };

  return (
    <>
      <BaseDialog
        open={open}
        mode={mode}
        title={mode === 'create' ? '임원 등록' : mode === 'edit' ? '임원 수정' : '임원 상세'}
        onClose={onClose}
        onSave={handleSave}
        onModeChange={setMode}
        disableSave={!isFormValid() || loading}
        loading={loading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 첫 번째 행: 직책, 직위 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel required>직책</InputLabel>
              <Select
                value={formData.positionName || ''}
                onChange={e => handleInputChange('positionName', e.target.value)}
                disabled={mode === 'view'}
                label="직책"
              >
                <MenuItem value="">선택하세요</MenuItem>
                {getPositionCodes().map(code => (
                  <MenuItem key={code.code} value={code.code}>
                    {code.codeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel required>직위</InputLabel>
              <Select
                value={formData.jobTitle || ''}
                onChange={e => handleInputChange('jobTitle', e.target.value)}
                disabled={mode === 'view'}
                label="직위"
              >
                <MenuItem value="">선택하세요</MenuItem>
                {getJobTitleCodes().map(code => (
                  <MenuItem key={code.code} value={code.code}>
                    {code.codeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 두 번째 행: 성명, 현 직책 부여일 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              required
              label="성명"
              value={formData.executiveName || ''}
              onChange={e => handleInputChange('executiveName', e.target.value)}
              disabled={mode === 'view'}
            />
            <TextField
              fullWidth
              required
              label="현 직책 부여일"
              type="date"
              value={formData.appointmentDate || ''}
              onChange={e => handleInputChange('appointmentDate', e.target.value)}
              disabled={mode === 'view'}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* 세 번째 행: 겸직여부 */}
          <FormControl fullWidth>
            <InputLabel>겸직여부</InputLabel>
            <Select
              value={formData.hasConcurrentPosition ? 'Y' : 'N'}
              onChange={e => handleInputChange('hasConcurrentPosition', e.target.value === 'Y')}
              disabled={mode === 'view'}
              label="겸직여부"
            >
              <MenuItem value="N">없음</MenuItem>
              <MenuItem value="Y">있음</MenuItem>
            </Select>
          </FormControl>

          {/* 네 번째 행: 겸직사항 */}
          {formData.hasConcurrentPosition && (
            <TextField
              fullWidth
              label="겸직사항"
              value={formData.concurrentDetails || ''}
              onChange={e => handleInputChange('concurrentDetails', e.target.value)}
              disabled={mode === 'view'}
              multiline
              rows={2}
            />
          )}

          {/* 조회 모드일 때 추가 정보 표시 */}
          {mode === 'view' && formData.id && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="등록일시"
                value={formData.createdAt || ''}
                disabled
              />
              <TextField
                fullWidth
                label="수정일시"
                value={formData.updatedAt || ''}
                disabled
              />
            </Box>
          )}
        </Box>

        {error && (
          <Box sx={{ color: 'error.main', mt: 2, textAlign: 'center' }}>
            {error}
          </Box>
        )}
      </BaseDialog>

      <Alert
        open={showSuccessAlert}
        message={mode === 'create' ? '임원이 등록되었습니다.' : '임원 정보가 수정되었습니다.'}
        severity="success"
        autoHideDuration={2000}
        onClose={() => setShowSuccessAlert(false)}
      />
    </>
  );
};

export default ExecutiveDetailDialog;
