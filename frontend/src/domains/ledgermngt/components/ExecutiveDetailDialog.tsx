import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import type { EmployeeSearchResult } from '@/domains/common/components/search/';
import EmployeeSearchpopup from '@/domains/common/components/search/EmployeeSearchPopup';
import execOfficerApi from '@/domains/ledgermngt/api/executivestatusApi';
import Alert from '@/shared/components/modal/Alert';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  CircularProgress,
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
import apiClient from '../../../app/common/api/client';

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
  const [positionDetailsLoading, setPositionDetailsLoading] = useState(false);

  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes } = useReduxState<{ data: CommonCode[] } | CommonCode[]>('codeStore/allCodes');

  // 공통코드 배열 추출 함수
  const getCodesArray = (): CommonCode[] => {
    if (!allCodes) return [];
    if (Array.isArray(allCodes)) return allCodes;
    if ('data' in allCodes && Array.isArray(allCodes.data)) return allCodes.data;
    return [];
  };

  // 공통코드 헬퍼 함수는 필요할 때 구현

  // 직책 ID로 직책 상세 정보 조회
  const fetchPositionDetails = async (positionId: number) => {
    try {
      setPositionDetailsLoading(true);
      console.log('직책 상세 정보 조회 시작:', positionId);

      const positionDetails = await execOfficerApi.getPositionDetails(positionId);
      console.log('직책 상세 정보 조회 결과:', positionDetails);

      setFormData(prev => ({
          ...prev,
          positionName:positionDetails.positionName||[]
        }));
      // 조회된 데이터 설정
      if (positionDetails) {
        setFormData(prev => ({
          ...prev,
          ownerDepts: positionDetails.ownerDepts || [],
          meetings: positionDetails.meetings || []
        }));
      }

      return positionDetails;
    } catch (error) {
      console.error('직책 상세 정보 조회 실패:', error);
      setError('직책 상세 정보를 불러yee.u패했습니다.');
      return null;
    } finally {
      setPositionDetailsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Executive 데이터:', executive);
    if (executive && open) {
      setFormData(executive);

      // 직책 ID가 있으면 직책 상세 정보 조회
      if (executive.positionsId) {
        console.log('직책 ID 확인:', executive.positionsId);
        fetchPositionDetails(executive.positionsId);
      }
    } else {
      setFormData({});
    }
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

      // 백엔드에 해당 API가 구현되어 있지 않으므로 임시로 빈 배열 설정
      // 실제 구현 시에는 백엔드에 API를 추가하고 아래 주석 처리된 코드를 사용해야 함
      setFormData((prev: any) => ({
        ...prev,
        ownerDepts: [],
        meetings: []
      }));
      console.log(employee,"12341234")
      const response=await apiClient.get('/users/employee/${employee.username}')
      /*
      // 사용자 ID로 소관부서와 주관회의체 데이터 조회
      if (employee.id) {
        try {
          // 소관부서 데이터 조회 (positions_owner_dept 테이블)
          const ownerDeptsResponse = await apiClient.get(`/positions/employee/${employee.id}/owner-departments`);

          // 주관회의체 데이터 조회 (positions_meeting 테이블)
          const meetingsResponse = await apiClient.get(`/positions/employee/${employee.id}/meetings`);

          // 조회된 데이터 설정
          setFormData((prev: any) => ({
            ...prev,
            ownerDepts: ownerDeptsResponse || [],
            meetings: meetingsResponse || []
          }));
        } catch (error) {
          console.error('소관부서/주관회의체 데이터 조회 실패:', error);
        }
      }
      */
    } catch (error) {
      console.error('사용자 선택 처리 중 오류 발생:', error);
    } finally {
      setLoading(false);
      setEmployeeSearchPopupOpen(false);
    }
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // onSave 함수 호출
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
    console.log(formData.positionName,formData.executiveName,formData.appointmentDate)
    return !!(
      formData.positionNameMapped &&
      formData.executiveName &&
      // formData.jobTitle &&
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
              value={formData.executiveName || ''}
              onChange={e => handleInputChange('executiveName', e.target.value)}
              disabled={mode === 'view'}
            />
            {mode !== 'view' && (
              <IconButton onClick={handleSearchEmployee}>
                <SearchIcon />
              </IconButton>
            )}

          </Box>

          {/* 두 번째 행: 성명, 현 직책 부여일 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="직위" value={''}
              disabled={true}
              sx={{ width: '50%' }} />
            <DatePicker
              label="현 직책 부여일"
              value={formData.appointmentDate}
              disabled={mode === 'view'}
              onChange={(date) => {
                setFormData((prev: any) => ({ ...prev, appointmentDate: date || new Date() }));
              }}
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
              {positionDetailsLoading && <CircularProgress size={20} />}
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
                  {(formData.ownerDepts || []).map((dept: any, index: number) => (
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
                        {positionDetailsLoading ? '소관부서 정보를 불러오는 중...' : '소관부서 정보가 없습니다.'}
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
              {positionDetailsLoading && <CircularProgress size={20} />}
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
                  {(formData.meetings || []).map((meeting: any, index: number) => (
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
                        {positionDetailsLoading ? '주관회의체 정보를 불러오는 중...' : '주관회의체 정보가 없습니다.'}
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
