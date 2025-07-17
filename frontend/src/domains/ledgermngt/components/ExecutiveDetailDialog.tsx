import apiClient from '@/app/common/api/client';
import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import type { EmployeeSearchResult } from '@/domains/common/components/search/';
import EmployeeSearchpopup from '@/domains/common/components/search/EmployeeSearchPopup';
import Alert from '@/shared/components/modal/Alert';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';
import type { DataGridColumn } from '@/shared/types/common';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  FormControl,
  FormControlLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { DatePicker } from '../../../shared/components';

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
  const handleEmployeeSelect = useCallback(async (employee: EmployeeSearchResult) => {
    setLoading(true);
    try {
      // 사용자 정보 설정
      setFormData((prev: any) => ({
        ...prev,
        employee,
        empId: employee.num,
        executiveName: employee.username, // 성명 자동 입력
      }));

      // 사용자 ID로 소관부서와 주관회의체 데이터 조회
      if (employee.id) {
        try {
          // 소관부서 데이터 조회 (positions_owner_dept 테이블)
          const ownerDeptsResponse = await apiClient.get(`/api/positions/employee/${employee.id}/owner-departments`);

          // 주관회의체 데이터 조회 (positions_meeting 테이블)
          const meetingsResponse = await apiClient.get(`/api/positions/employee/${employee.id}/meetings`);

          // 조회된 데이터 설정
          setFormData((prev: any) => ({
            ...prev,
            ownerDepts: ownerDeptsResponse || [],
            meetings: meetingsResponse || []
          }));
        } catch (error) {
          console.error('소관부서/주관회의체 데이터 조회 실패:', error);
          // 에러가 발생해도 사용자 선택은 유지
        }
      }
    } catch (error) {
      console.error('사용자 선택 처리 중 오류 발생:', error);
    } finally {
      setLoading(false);
      setEmployeeSearchPopupOpen(false);
    }
  }, []);
  const handleSave = () => {
    try {
      setLoading(true);
      setError(null);

      // onSave 함수가 Promise를 반환하는지 확인하고 적절히 처리
      const result = onSave(formData);
      if (result instanceof Promise) {
        result
          .then(() => {
            setShowSuccessAlert(true);
            setTimeout(() => {
              setShowSuccessAlert(false);
              onClose();
            }, 1000);
          })
          .catch((err) => {
            console.error('임원 정보 저장 실패:', err);
            setError('임원 정보 저장에 실패했습니다.');
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setShowSuccessAlert(true);
        setTimeout(() => {
          setShowSuccessAlert(false);
          onClose();
        }, 1000);
        setLoading(false);
      }
    } catch (err) {
      console.error('임원 정보 저장 실패:', err);
      setError('임원 정보 저장에 실패했습니다.');
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
          {/* 소관부서 */}
          <Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
            >
              <Box sx={{ fontWeight: 'bold', fontSize: '1rem' }}>소관부서</Box>
            </Box>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', width: 430 }}>부서코드</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>부서명</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(formData.ownerDepts || []).map((dept, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={dept.deptCode || ''}
                          disabled
                          placeholder='부서코드'
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={dept.deptName || ''}
                          disabled
                          placeholder='부서명'
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!formData.ownerDepts || formData.ownerDepts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        소관부서 정보가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* 주관회의체 */}
          <Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
            >
              <Box sx={{ fontWeight: 'bold', fontSize: '1rem' }}>주관회의체</Box>
            </Box>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>회의체</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>위원장/위원</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>개최주기</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>주요 심의·의결사항</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(formData.meetings || []).map((meeting, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={meeting.meetingBodyName || ''}
                          disabled
                          placeholder='회의체명'
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={meeting.memberGubun || ''}
                          disabled
                          placeholder='위원장/위원'
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={meeting.meetingPeriod || ''}
                          disabled
                          placeholder='개최주기'
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={meeting.deliberationContent || ''}
                          disabled
                          placeholder='주요 심의·의결사항'
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!formData.meetings || formData.meetings.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        주관회의체 정보가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

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
