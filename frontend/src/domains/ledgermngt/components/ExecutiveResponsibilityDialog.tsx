import { useCommonCodes, useGetCodeName, type CommonCode } from '@/shared/utils/codeUtils';
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
  Tabs,
  Tab
} from '@mui/material';
import React, { useEffect, useState } from 'react';


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
  const [formData, setFormData] = useState<any>({});
  const [positionDetailsLoading, setPositionDetailsLoading] = useState(false);
  const [originalDate, setOriginalDate] = useState<Date | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  // 공통코드 가져오기
  const allCodes = useCommonCodes();
  const getCodeNameFn = useGetCodeName();

  // 직책 ID로 직책 상세 정보 조회
  const fetchPositionDetails = async (positionId: number) => {
    if (!positionId) return null;

    try {
      setPositionDetailsLoading(true);
      const positionDetails = await execOfficerApi.getPositionDetails(positionId);

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



  useEffect(() => {
    if (!data || !open) return;

    // 날짜 설정
    const dateValue = data.execofficer_dt ? new Date(data.execofficer_dt) : null;
    setOriginalDate(dateValue);

    // 그룹화된 데이터인지 확인
    const isGrouped = data.items && Array.isArray(data.items);
    const firstItem = isGrouped ? data.items[0] || {} : data;
    // 공통 데이터 설정
    const commonData = {
      ...data,
      positionsNm: data.position || '',
      executiveName: firstItem.empName || '',
      hasConcurrentPosition: firstItem.dualYn || 'N',
      concurrentPosition: firstItem.dualDetails || '',
      jobRankCd:  isGrouped ? firstItem.jobTitle || '' : data.jobRank || '',
      isGrouped,
      ...(isGrouped && {
        groupItems: data.items,
        count: data.count || data.items.length
      }),
      ...(!isGrouped && {
        responsibilityContent: data.responsibilityContent || '',
        deptCode: data.deptCode || '',
        deptName: data.deptName || ''
      })
    };
    setFormData(commonData);

    // 직책 상세 정보 조회
    const positionId = isGrouped ? firstItem.id : data.id;
    if (positionId) {
      fetchPositionDetails(positionId);
    }

    setCurrentTab(0);
  }, [data, open]);

  // 탭 변경 핸들러
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // 기본 정보 필드 렌더링 헬퍼
  const renderBasicInfoFields = () => (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%', marginTop: '10px' }}>
        <TextField
          label="직책"
          value={formData.positionsNm || ''}
          disabled={true}
          mode='readonly'
          sx={{ flex: 1 }}
        />
        <TextField
          label="성명"
          value={formData.executiveName || ''}
          disabled={true}
          mode='readonly'
          sx={{ flex: 1 }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="직위"
          value={formData.jobRankCd || ''}
          disabled={true}
          mode='readonly'
          sx={{ flex: 1 }}
        />
        <TextField
          label="현 직책 부여일"
          value={originalDate ? originalDate.toLocaleDateString() : ''}
          disabled={true}
          mode='readonly'
          sx={{ flex: 1 }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ flex: '0 0 200px', display: 'flex', alignItems: 'center' }}>
          <Box sx={{ fontWeight: 'bold', fontSize: '0.9rem', mr: 2, minWidth: '60px' }}>겸직여부</Box>
          <RadioGroup
            row
            value={formData.hasConcurrentPosition || 'N'}
            name="hasConcurrentPosition"
            sx={{ flex: 1, width: '100%' }}
          >
            <FormControlLabel value="N" control={<Radio />} label="없음" disabled={true} />
            <FormControlLabel value="Y" control={<Radio />} label="있음" disabled={true} />
          </RadioGroup>
        </Box>
        <TextField
          label="겸직사항"
          value={formData.concurrentPosition || ''}
          disabled={true}
          mode='readonly'
          sx={{ flex: 1 }}
        />
      </Box>
    </>
  );

  // 셀 병합을 위한 헬퍼 함수
  const calculateRowSpans = (items: any[]) => {
    const columns = ['executiveName', 'jobRank', 'empNo', 'responsibility', 'responsibilityDetail', 'managementDuty', 'relatedBasis'];
    const rowSpans: { [key: string]: number[] } = {};

    columns.forEach(column => {
      rowSpans[column] = new Array(items.length).fill(1);

      for (let i = 1; i < items.length; i++) {
        const getValue = (item: any, col: string) => {
          if (col === 'jobRank') {
            return getCodeNameFn('JOB_RANK', item[col]) || item[col] || '해당없음';
          }
          return item[col] || '해당없음';
        };

        const currentValue = getValue(items[i], column);
        const prevValue = getValue(items[i - 1], column);

        if (currentValue === prevValue) {
          rowSpans[column][i] = 0;
          // 이전 행의 rowSpan 증가
          let j = i - 1;
          while (j >= 0 && rowSpans[column][j] === 0) {
            j--;
          }
          if (j >= 0) {
            rowSpans[column][j]++;
          }
        }
      }
    });

    return rowSpans;
  };

  // 테이블 셀 렌더링 헬퍼
  const renderTableCell = (item: any, column: string, rowSpan: number, index: number) => {
    if (rowSpan === 0) return null;

    const getValue = () => {
      switch (column) {
        case 'jobRank':
          return getCodeNameFn('JOB_RANK', item.jobRank) || item.jobRank || '해당없음';
        default:
          return item[column] || '해당없음';
      }
    };

    return (
      <TableCell
        key={column}
        rowSpan={rowSpan}
        sx={{
          verticalAlign: 'middle',
          borderRight: rowSpan > 1 ? '1px solid #e0e0e0' : undefined
        }}
      >
        {getValue()}
      </TableCell>
    );
  };

  return (
    <>
      <BaseDialog
        mode={'onlyRead'}
        open={open}
        title={'임원 책무 상세조회'}
        onClose={onClose}
        loading={positionDetailsLoading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* 탭 헤더 */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="임원 책무 상세 탭">
              <Tab label="기본 정보 / 소관부서 / 회의체" />
              {formData.isGrouped && <Tab label="상세 목록" />}
            </Tabs>
          </Box>

          {/* 탭 내용 */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {/* 첫 번째 탭: 기본 정보 및 소관부서/회의체 */}
            {currentTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 기본 정보 */}
                {renderBasicInfoFields()}

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
                                value={getCodeNameFn('PERIOD', meeting.meetingPeriod || '')}
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

            {/* 두 번째 탭: 상세 목록 (그룹화된 데이터인 경우만) */}
            {currentTab === 1 && formData.isGrouped && (
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
                        const columns = ['executiveName', 'jobRank', 'empNo', 'responsibility', 'responsibilityDetail', 'managementDuty', 'relatedBasis'];

                        return items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            {columns.map(column =>
                              renderTableCell(item, column, rowSpans[column][index], index)
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

      </BaseDialog>
    </>
  );
};

export default ExecutiveDetailDialog;
