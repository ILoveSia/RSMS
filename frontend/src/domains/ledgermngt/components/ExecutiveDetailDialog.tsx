import type { EmployeeSearchResult } from '@/app/components/EmployeeSearchPopup';
import EmployeeSearchpopup from '@/app/components/EmployeeSearchPopup';
import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import Alert from '@/shared/components/modal/Alert';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { Box, FormControl, FormControlLabel, IconButton, Radio, RadioGroup } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { DatePicker } from '../../../shared/components';
import DataGrid from '@/shared/components/ui/data-display/DataGrid';
import type { DataGridColumn } from '@/shared/types/common';

interface ExecutiveDetailDialogProps {
  mode: DialogMode;
  open: boolean;
  // positionName: string;
  onClose: () => void;
  executive: any | null;
  onSave: (data: any) => void;
  onChangeMode: (mode: DialogMode) => void;
}

const ExecutiveDetailDialog: React.FC<ExecutiveDetailDialogProps> = ({
  open,
  onClose,
  executive,
  onChangeMode,
  mode,
  onSave,
  // positionName,
}) => {
  // const [mode, setMode] = useState<DialogMode>('view');
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [employeeSearchPopupOpen, setEmployeeSearchPopupOpen] = useState(false);
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
  const departColumns: DataGridColumn<any>[] = [
    {
      field: 'deptCd',
      headerName: '부서코드',
      width: 200,
    },
    {
      field: 'deptName',
      headerName: '부서명',
      width: 200,
    },
  ];
  const getJobTitleCodes = () => {
    const codes = getCodesArray();
    return codes
      .filter(code => code.groupCode === 'JOB_TITLE' && code.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  useEffect(() => {
    console.log(executive);
    if (executive && open) {
      setFormData(executive);
    } else {
      setFormData({});
    }
    // if(positionName&&open) {
    //   setFormData(positionName);
    // }
    setError(null);
  }, [executive, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleEmployeeSelect = useCallback((employee: EmployeeSearchResult) => {
    setFormData((prev: any) => ({
      ...prev,
      employee,
      executiveName: employee.username, // 성명 자동 입력
    }));
    setEmployeeSearchPopupOpen(false);
  }, []);
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

  const handleSearchEmployee = () => {
    setEmployeeSearchPopupOpen(true);
  };

  return (
    <>
      <BaseDialog
        open={open}
        mode={mode}
        title={mode === 'create' ? '임원 등록' : mode === 'edit' ? '임원 수정' : '임원 상세'}
        onClose={onClose}
        onSave={handleSave}
        onModeChange={onChangeMode}
        disableSave={!isFormValid() || loading}
        loading={loading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 첫 번째 행: 직책, 직위 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <TextField label="직책"
              value={formData.positionNameMapped || ''}
              disabled={mode === 'view'}
              />
            </FormControl>
              <TextField
              fullWidth
              required
              label="성명"
              value={formData.empId || ''}
              onChange={e => handleInputChange('executiveName', e.target.value)}
              disabled={mode === 'view'}
              />
              {mode !== 'view' && (
                <IconButton>
                  <SearchIcon onClick={handleSearchEmployee}/>
                </IconButton>
              )}

          </Box>

          {/* 두 번째 행: 성명, 현 직책 부여일 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="직위" value={ ''}
            disabled={true}
            sx={{ width: '50%' }}/>
            <DatePicker
              label="현 직책 부여일"
              value={formData.appointmentDate }
              disabled={mode === 'view'}
              onChange={(date) => {
                setFormData((prev: any) => ({ ...prev, appointmentDate: date || new Date() }));
              }}
              // disabled={mode === 'view'}
              // sx={{ width: '50%' }}
              // InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* 세 번째 행: 겸직여부 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
              <RadioGroup
                row
                value={formData.hasConcurrentPosition ? 'Y' : 'N'}
                onChange={e => handleInputChange('hasConcurrentPosition', (e as React.ChangeEvent<HTMLInputElement>).target.value === 'Y')}
                name="hasConcurrentPosition"
              >
                <FormControlLabel value="N" control={<Radio />} label="없음" disabled={mode === 'view'} />
                <FormControlLabel value="Y" control={<Radio />} label="있음" disabled={mode === 'view'} />
              </RadioGroup>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="겸직사항"
                value={formData.concurrentPosition || ''}
                disabled={mode === 'view'}
              />
            </Box>
          </Box>
          <DataGrid
            columns={departColumns}
            rows={formData.departments || []}
          />

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
      <EmployeeSearchpopup
        open={employeeSearchPopupOpen}
        onClose={() => setEmployeeSearchPopupOpen(false)}
        onSelect={handleEmployeeSelect}
        selectedEmployee={formData.employee}
      />
    </>
  );
};

export default ExecutiveDetailDialog;
