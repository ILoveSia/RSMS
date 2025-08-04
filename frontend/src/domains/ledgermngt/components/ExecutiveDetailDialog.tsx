import apiClient from '@/app/common/api/client';
import { useCommonCodes, useGetCodeName, type CommonCode } from '@/shared/utils/codeUtils';
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
  const [originalDate, setOriginalDate] = useState<Date | null>(null);

  // 공통코드 가져오기
  const allCodes = useCommonCodes();
  const getCodeNameFn = useGetCodeName();

  // 직책 ID로 직책 상세 정보 조회
  const fetchPositionDetails = async (positionId: number) => {
    try {
      setPositionDetailsLoading(true);

      const positionDetails = await execOfficerApi.getPositionDetails(positionId);

      setFormData((prev: Record<string, any>) => ({
        ...prev,
        positionName: positionDetails.positionName || []
      }));
      // 조회된 데이터 설정
      if (positionDetails) {
        setFormData((prev: Record<string, any>) => ({
          ...prev,
          ownerDepts: positionDetails.ownerDepts || [],
          meetings: positionDetails.meetings || []
        }));
      }

      return positionDetails;
    } catch (error) {
      console.error('직책 상세 정보 조회 실패:', error);
      return null;
    } finally {
      setPositionDetailsLoading(false);
    }
  };

  // 사용자 정보 조회 함수
  const fetchUserInfo = async (username: string) => {
    // 문자열 날짜를 Date 객체로 변환
    const dateValue = executive.execofficer_dt ? new Date(executive.execofficer_dt) : null;
    setOriginalDate(dateValue)
    try {
      const response = await apiClient.get(`/users/username/${username}`);
      return response; // apiClient가 이미 ApiResponse wrapper를 unwrap해서 data만 반환
    } catch (error) {
      console.error('사용자 정보 조회 중 오류 발생:', error);
      return null;
    }
  };



  useEffect(() => {
    if (executive && open) {
      setOriginalDate(executive.execofficer_dt ? new Date(executive.execofficer_dt) : null)
      // employee 테이블 구조에 맞게 수정
      // empId는 사번이므로 그대로 사용
      // dualYn 필드를 hasConcurrentPosition으로 매핑하여 라디오박스에 표시되도록 함
      // dualDetails 필드를 concurrentPosition으로 매핑하여 겸직사항 필드에 표시되도록 함
      setFormData({
        ...executive,
        executiveName: executive.empId || '', // empId는 사번이므로 성명으로 표시하기 위해 임시로 설정
        hasConcurrentPosition: executive.dualYn === 'Y',
        concurrentPosition: executive.dualDetails || ''
      });

      // 직책 ID가 있으면 직책 상세 정보 조회
      if (executive.positionsId) {
        fetchPositionDetails(executive.positionsId);
      }

      // empId(사번)가 있으면 employee 테이블에서 사용자 정보 조회하여 성명과 직급 가져오기
      if (executive.empId) {
        const fetchUser = async () => {
          try {
            // employee 테이블에서 사번으로 조회
            const userInfo = await apiClient.get(`/users/num/${executive.empId}`);
            if (userInfo) {
              // userInfo가 any 타입이므로 타입 안전하게 처리
              if (typeof userInfo === 'object' && userInfo !== null) {
                const userData = userInfo as any;
                setFormData((prev: Record<string, any>) => ({
                  ...prev,
                  executiveName: userData.username || '', // 성명 설정
                  jobRankCd: userData.jobRankCd || '' // 직급 코드 설정
                }));
              }
            }
          } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
            // 조회 실패 시 empId를 그대로 사용
            setFormData((prev: Record<string, any>) => ({
              ...prev,
              executiveName: executive.empId || ''
            }));
          }
        };
        fetchUser();
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
        empId: employee.num, // 사번으로 설정
        executiveName: employee.username, // 성명 자동 입력
      }));

      setFormData((prev: any) => ({
        ...prev,
        ownerDepts: [],
        meetings: []
      }));
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

      // 저장 전에 hasConcurrentPosition과 concurrentPosition을 dualYn과 dualDetails로 변환
      const dataToSave = {
        ...formData,
        dualYn: formData.hasConcurrentPosition ? 'Y' : 'N',
        dualDetails: formData.concurrentPosition || ''
      };

      // onSave 함수 호출
      await onSave(dataToSave);

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
      formData.positionsNm &&
      formData.executiveName &&
      // formData.jobTitle &&
      formData.execofficer_dt
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
          {/* 첫 번째 행: 직책, 성명 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="직책"
              value={formData.positionsNm || ''}
              mode={'readonly'}
              sx={{ flex: 1 }}
            />
            <TextField
              required
              label="성명"
              value={formData.executiveName || ''}
              onChange={e => handleInputChange('executiveName', e.target.value)}
              mode={'readonly'}
              sx={{ flex: 1 }}
            />
            {mode !== 'view' && (
              <IconButton onClick={handleSearchEmployee} sx={{ flexShrink: 0 }}>
                <SearchIcon />
              </IconButton>
            )}
          </Box>

          {/* 두 번째 행: 직위, 현 직책 부여일 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="직위"
              value={formData.employee?.jobRankCd
                ? getCodeNameFn('JOB_RANK', formData.employee.jobRankCd)
                : formData.jobRankCd
                  ? getCodeNameFn('JOB_RANK', formData.jobRankCd)
                  : ''}
              mode="readonly"
              sx={{ flex: 1 }}
            />
            <DatePicker
              label="현 직책 부여일"
              value={originalDate}
              mode={mode === 'view' ? 'readonly' : 'editable'}
              onChange={(date) => {
                setOriginalDate(date)
                setFormData((prev: any) => ({ ...prev, execofficer_dt: date || '9999-12-31' }));
              }}
              onClose={() => {
                setOriginalDate(null);
              }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* 세 번째 행: 겸직여부, 겸직사항 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: '0 0 200px', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ fontWeight: 'bold', fontSize: '0.9rem', mr: 2, minWidth: '60px' }}>겸직여부</Box>
              <RadioGroup
                row
                value={formData.hasConcurrentPosition ? 'Y' : 'N'}
                onChange={e => handleInputChange('hasConcurrentPosition', (e as React.ChangeEvent<HTMLInputElement>).target.value === 'Y')}
                name="hasConcurrentPosition"
              >
                <FormControlLabel value="N" control={<Radio />} label="없음" disabled={mode === 'view'} />
                <FormControlLabel value="Y" control={<Radio />} label="있음" disabled={mode === 'view'} />
              </RadioGroup>
            </Box>
            <TextField
              label="겸직사항"
              value={formData.concurrentPosition || ''}
              onChange={e => handleInputChange('concurrentPosition', e.target.value)}
              mode={mode === 'view' || !formData.hasConcurrentPosition ? 'readonly' : 'editable'}
              sx={{ flex: 1 }}
            />
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
                          mode="readonly"
                          readonlyPlaceholder="부서코드"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={dept.deptName || ''}
                          mode="readonly"
                          readonlyPlaceholder="부서명"
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
                          mode="readonly"
                          readonlyPlaceholder="회의체명"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={getCodeNameFn('MEB_GUBUN', meeting.memberGubun || '')}
                          mode="readonly"
                          readonlyPlaceholder="위원장/위원"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={getCodeNameFn('PERIOD', meeting.meetingPeriod || '')}
                          mode="readonly"
                          readonlyPlaceholder="개최주기"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={meeting.deliberationContent || ''}
                          mode="readonly"
                          readonlyPlaceholder="주요 심의·의결사항"
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
