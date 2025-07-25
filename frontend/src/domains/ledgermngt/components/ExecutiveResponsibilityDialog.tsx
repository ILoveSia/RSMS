import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import EmployeeSearchpopup from '@/domains/common/components/search/EmployeeSearchPopup';
import execOfficerApi from '@/domains/ledgermngt/api/executivestatusApi';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';
import {
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
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
import React, { useEffect, useState } from 'react';
import { DatePicker } from '../../../shared/components';

interface ExecutiveDetailDialogProps {
  open: boolean;
  // positionName: string;
  onClose: () => void;
  data: any | null;
}

const ExecutiveDetailDialog: React.FC<ExecutiveDetailDialogProps> = ({
  open,
  onClose,
  data,
}) => {
  // const [mode, setMode] = useState<DialogMode>('view');
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeSearchPopupOpen, setEmployeeSearchPopupOpen] = useState(false);
  const [positionDetailsLoading, setPositionDetailsLoading] = useState(false);
  const [originalDate, setOriginalDate] = useState<Date | null>(null);
  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes, setData: setAllCodes } = useReduxState<{ data: CommonCode[] } | CommonCode[]>('codeStore/allCodes');

  // 공통코드 배열 추출 함수
  const getCodesArray = (): CommonCode[] => {
    if (!allCodes) return [];
    if (Array.isArray(allCodes)) {
      return allCodes;
    }
    if (typeof allCodes === 'object' && 'data' in allCodes && Array.isArray(allCodes.data)) {
      return allCodes.data;
    }
    return [];
  };

  // 직위 코드를 직위명으로 변환하는 함수 (PositionDialog.tsx 패턴 적용)
  const getCodeName = (groupCode: string, code: string | null | undefined): string => {
    if (!code) return '';

    // 공통코드 배열에서 직접 찾기
    const codes = getCodesArray();
    const matchingCode = codes.find(item => item.groupCode === groupCode && item.code === code);

    if (matchingCode) {
      return matchingCode.codeName;
    }

    // 직위 코드 매핑 (fallback)
    const jobRankMapping: Record<string, string> = {
      'JR001': '사원',
      'JR002': '대리',
      'JR003': '과장',
      'JR004': '차장',
      'JR005': '부장',
      'JR006': '이사',
      'JR007': '상무',
      'JR008': '전무',
      'JR009': '부사장',
      'JR010': '사장',
      'JR011': '부회장',
      'JR012': '회장'
    };

    if (groupCode === 'JOB_RANK' && code in jobRankMapping) {
      return jobRankMapping[code];
    }

    return code;
  };

  // 직책 ID로 직책 상세 정보 조회
  const fetchPositionDetails = async (positionId: number) => {
    const dateValue = data.execofficer_dt ? new Date(data.execofficer_dt) : null;
    setOriginalDate(dateValue)
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
  // 공통코드 초기화 useEffect (PositionDialog.tsx 패턴 적용)
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
        setAllCodes(parsedCodes);
      } catch (error) {
        console.error('localStorage 공통코드 복원 실패:', error);
        localStorage.removeItem('commonCodes');
      }
    }
  }, [allCodes, setAllCodes]);

  useEffect(() => {
    if (data && open) {
      // empId 필드를 executiveName으로도 설정하여 성명 필드에 표시되도록 함
      // dualYn 필드를 hasConcurrentPosition으로 매핑하여 라디오박스에 표시되도록 함
      // dualDetails 필드를 concurrentPosition으로 매핑하여 겸직사항 필드에 표시되도록 함
      setLoading(true);
      setFormData({
        ...data,
        positionNameMapped: data.position || '',
        executiveName: data.executiveName || '',
        hasConcurrentPosition: data.dualYn === 'Y',
        concurrentPosition: data.dualDetails || '',
        responsibilityContent: data.responsibilityContent || '',
        jobRankCd: data.jobRank || '',
        deptCode: data.deptCode || '',
        deptName: data.deptName || '',
      });

      // 직책 ID가 있으면 직책 상세 정보 조회
      if (data.id) {
        fetchPositionDetails(data.id);
      }
    }
    setLoading(false);
    setError(null);
  }, [data, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  }


  return (
    <>
      <BaseDialog
        mode={'onlyRead'}
        open={open}
        title={'임원 책무 상세조회'}
        onClose={onClose}
        // onModeChange={onChangeMode}
        loading={loading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 첫 번째 행: 직책, 성명 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="직책"
              value={formData.positionNameMapped || ''}
              disabled={true}
              sx={{ flex: 1 }}
            />
            <TextField
              required
              label="성명"
              value={formData.executiveName || ''}
              disabled={true}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* 두 번째 행: 직위, 현 직책 부여일 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="직위"
              value={formData.employee?.jobRankCd
                ? getCodeName('JOB_RANK', formData.employee.jobRankCd)
                : formData.jobRankCd
                  ? getCodeName('JOB_RANK', formData.jobRankCd)
                  : ''}
              disabled={true}
              sx={{ flex: 1 }}
            />
            <DatePicker
              label="현 직책 부여일"
              value={originalDate}
              disabled={true}
              onChange={(date) => {
                setFormData((prev: any) => ({ ...prev, appointmentDate: date || new Date() }));
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
                name="hasConcurrentPosition"
              >
                <FormControlLabel value="N" control={<Radio />} label="없음" disabled={true} />
                <FormControlLabel value="Y" control={<Radio />} label="있음" disabled={true} />
              </RadioGroup>
            </Box>
            <TextField
              label="겸직사항"
              value={formData.concurrentPosition || ''}
              disabled={true}
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
      <EmployeeSearchpopup
        open={employeeSearchPopupOpen}
        onClose={() => setEmployeeSearchPopupOpen(false)}
      />
    </>
  );
};

export default ExecutiveDetailDialog;
