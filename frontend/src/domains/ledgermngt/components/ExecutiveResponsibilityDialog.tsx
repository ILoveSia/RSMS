import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import EmployeeSearchpopup from '@/domains/common/components/search/EmployeeSearchPopup';
import execOfficerApi from '@/domains/ledgermngt/api/executivestatusApi';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';
import {
  Box,
  CircularProgress,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DatePicker } from '../../../shared/components';

interface ExecutiveDetailDialogProps {
  open: boolean;
  onClose: () => void;
  data: any | null; // 그룹화된 데이터 (ExecutiveResponsibilityRow) 또는 개별 데이터
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
  
  // 탭 상태
  const [currentTab, setCurrentTab] = useState(0);
  
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
      setLoading(true);

      // 그룹화된 데이터인지 확인 (items 배열이 있으면 그룹화된 데이터)
      if (data.items && Array.isArray(data.items)) {
        // 그룹화된 데이터 처리
        setFormData({
          ...data,
          positionNameMapped: data.position || '',
          isGrouped: true,
          groupItems: data.items,
          count: data.count || data.items.length
        });

        // 첫 번째 항목의 ID로 직책 상세 정보 조회
        if (data.items.length > 0 && data.items[0].id) {
          fetchPositionDetails(data.items[0].id);
        }
      } else {
        // 개별 데이터 처리 (기존 로직)
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
          isGrouped: false
        });

        // 직책 ID가 있으면 직책 상세 정보 조회
        if (data.id) {
          fetchPositionDetails(data.id);
        }
      }
    }
    setLoading(false);
    setError(null);
    setCurrentTab(0); // 다이얼로그 열릴 때 첫 번째 탭으로 초기화
  }, [data, open]);

  // 탭 변경 핸들러
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };




  // 셀 병합을 위한 헬퍼 함수
  const calculateRowSpans = (items: any[]) => {
    const columns = ['executiveName', 'jobRank', 'empNo', 'responsibility', 'responsibilityDetail', 'managementDuty', 'relatedBasis'];
    const rowSpans: { [key: string]: number[] } = {};

    columns.forEach(column => {
      rowSpans[column] = [];
      let currentSpan = 1;

      for (let i = 0; i < items.length; i++) {
        if (i === 0) {
          // 첫 번째 행
          rowSpans[column][i] = 1;
        } else {
          const currentValue = column === 'jobRank'
            ? getCodeName('JOB_RANK', items[i][column]) || items[i][column] || '해당없음'
            : items[i][column] || '해당없음';
          const prevValue = column === 'jobRank'
            ? getCodeName('JOB_RANK', items[i - 1][column]) || items[i - 1][column] || '해당없음'
            : items[i - 1][column] || '해당없음';

          if (currentValue === prevValue) {
            // 이전 행과 같은 값
            rowSpans[column][i] = 0; // 병합되어 숨겨짐
            currentSpan++;
            // 이전 행들의 rowSpan 업데이트
            for (let j = i - currentSpan + 1; j < i; j++) {
              if (rowSpans[column][j] > 0) {
                rowSpans[column][j] = currentSpan;
                break;
              }
            }
            rowSpans[column][i - currentSpan + 1] = currentSpan;
          } else {
            // 다른 값
            currentSpan = 1;
            rowSpans[column][i] = 1;
          }
        }
      }
    });

    return rowSpans;
  };

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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* 탭 헤더 */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="임원 책무 상세 탭">
              <Tab label="기본 정보" />
              <Tab label="소관부서 및 회의체" />
              {formData.isGrouped && <Tab label="상세 목록" />}
            </Tabs>
          </Box>

          {/* 탭 내용 */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {/* 첫 번째 탭: 기본 정보 */}
            {currentTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* 직책 정보 */}
                <Box sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 1, color: 'primary.main' }}>
                  직책: {formData.positionNameMapped || '해당없음'}
                </Box>

                {/* 그룹화된 데이터인 경우 요약 정보 */}
                {formData.isGrouped && (
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>요약 정보</Typography>
                    <Typography variant="body2" color="text.secondary">
                      총 {formData.count || 0}건의 임원 책무 데이터가 있습니다.
                    </Typography>
                    {formData.groupItems && formData.groupItems.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          • 대표 임원: {formData.groupItems[0].executiveName || '해당없음'}
                        </Typography>
                        <Typography variant="body2">
                          • 주요 책무: {formData.groupItems[0].responsibility || '해당없음'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* 개별 데이터인 경우 상세 정보 */}
                {!formData.isGrouped && (
                  <>
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
                  </>
                )}
              </Box>
            )}

            {/* 두 번째 탭: 소관부서 및 회의체 */}
            {currentTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            )}

            {/* 세 번째 탭: 상세 목록 (그룹화된 데이터인 경우만) */}
            {currentTab === 2 && formData.isGrouped && (
              <Box>
                <Box sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 2 }}>
                  임원별 상세 책무 목록 ({formData.count || 0}건)
                </Box>
                <TableContainer component={Paper} variant='outlined'>
                  <Table size='small'>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>성명</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>직위</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>사번</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>책무</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>책무 세부내용</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>관리의무</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>관련근거</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        const items = formData.groupItems || [];
                        const rowSpans = calculateRowSpans(items);

                        return items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            {/* 성명 */}
                            {rowSpans.executiveName[index] > 0 && (
                              <TableCell
                                rowSpan={rowSpans.executiveName[index]}
                                sx={{
                                  verticalAlign: 'middle',
                                  borderRight: rowSpans.executiveName[index] > 1 ? '1px solid #e0e0e0' : undefined
                                }}
                              >
                                {item.executiveName || '해당없음'}
                              </TableCell>
                            )}

                            {/* 직위 */}
                            {rowSpans.jobRank[index] > 0 && (
                              <TableCell
                                rowSpan={rowSpans.jobRank[index]}
                                sx={{
                                  verticalAlign: 'middle',
                                  borderRight: rowSpans.jobRank[index] > 1 ? '1px solid #e0e0e0' : undefined
                                }}
                              >
                                {getCodeName('JOB_RANK', item.jobRank) || item.jobRank || '해당없음'}
                              </TableCell>
                            )}

                            {/* 사번 */}
                            {rowSpans.empNo[index] > 0 && (
                              <TableCell
                                rowSpan={rowSpans.empNo[index]}
                                sx={{
                                  verticalAlign: 'middle',
                                  borderRight: rowSpans.empNo[index] > 1 ? '1px solid #e0e0e0' : undefined
                                }}
                              >
                                {item.empNo || '해당없음'}
                              </TableCell>
                            )}

                            {/* 책무 */}
                            {rowSpans.responsibility[index] > 0 && (
                              <TableCell
                                rowSpan={rowSpans.responsibility[index]}
                                sx={{
                                  verticalAlign: 'middle',
                                  borderRight: rowSpans.responsibility[index] > 1 ? '1px solid #e0e0e0' : undefined
                                }}
                              >
                                {item.responsibility || '해당없음'}
                              </TableCell>
                            )}

                            {/* 책무 세부내용 */}
                            {rowSpans.responsibilityDetail[index] > 0 && (
                              <TableCell
                                rowSpan={rowSpans.responsibilityDetail[index]}
                                sx={{
                                  verticalAlign: 'middle',
                                  borderRight: rowSpans.responsibilityDetail[index] > 1 ? '1px solid #e0e0e0' : undefined
                                }}
                              >
                                {item.responsibilityDetail || '해당없음'}
                              </TableCell>
                            )}

                            {/* 관리의무 */}
                            {rowSpans.managementDuty[index] > 0 && (
                              <TableCell
                                rowSpan={rowSpans.managementDuty[index]}
                                sx={{
                                  verticalAlign: 'middle',
                                  borderRight: rowSpans.managementDuty[index] > 1 ? '1px solid #e0e0e0' : undefined
                                }}
                              >
                                {item.managementDuty || '해당없음'}
                              </TableCell>
                            )}

                            {/* 관련근거 */}
                            {rowSpans.relatedBasis[index] > 0 && (
                              <TableCell
                                rowSpan={rowSpans.relatedBasis[index]}
                                sx={{
                                  verticalAlign: 'middle',
                                  borderRight: rowSpans.relatedBasis[index] > 1 ? '1px solid #e0e0e0' : undefined
                                }}
                              >
                                {item.relatedBasis || '해당없음'}
                              </TableCell>
                            )}
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
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
