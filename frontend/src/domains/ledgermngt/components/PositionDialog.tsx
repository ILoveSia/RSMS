/**
 * 직책 등록/수정/조회 다이얼로그 컴포넌트
 *
 * @description
 * - DDD 패턴을 따른 도메인 중심 설계
 * - SOLID 원칙 준수
 * - 단일 책임 원칙 (SRP)에 따라 컴포넌트 분리
 */
import DepartmentSearchPopup, { type Department } from '@/app/components/DepartmentSearchPopup';
import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import { MeetingBodySearchDialog, type MeetingBodySearchResult } from '@/domains/common/components/search';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import { Remove as RemoveIcon, Search as SearchIcon } from '@mui/icons-material';
import ComboBox from '@/shared/components/ui/form/ComboBox';
import {
  Alert,
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

// Domain Types
interface OwnerDept {
  id: string;
  deptCode: string;
  deptName: string;
}

interface MainMeeting {
  id: string;
  meetingCode: string;
  meetingName: string;
}

interface FormData {
  positionName: string;
  writeDeptCd: string;
  ownerDepts: OwnerDept[];
  mainMeetings: MainMeeting[];
}

interface PositionDialogProps {
  open: boolean;
  mode: DialogMode;
  positionId: number | null;
  onClose: () => void;
  onSave: () => void;
  onChangeMode: (mode: DialogMode) => void;
}

const PositionDialog: React.FC<PositionDialogProps> = ({
  open,
  mode,
  positionId,
  onClose,
  onSave,
  onChangeMode,
}) => {
  // State Management
  const [formData, setFormData] = useState<FormData>({
    positionName: '',
    writeDeptCd: '',
    ownerDepts: [],
    mainMeetings: [],
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Popup States
  const [deptSearchOpen, setDeptSearchOpen] = useState(false);
  const [currentOwnerDeptId, setCurrentOwnerDeptId] = useState<string | null>(null);
  // 회의체 검색 다이얼로그 상태
  const [meetingSearchOpen, setMeetingSearchOpen] = useState(false);

  // Common Code Management
  const { data: commonCodeState } = useReduxState<{ data: CommonCode[] }>('codeStore/allCodes');
  const commonCodes = commonCodeState?.data ?? [];

  // Common Code Filter
  const getFilteredCodes = useCallback((groupCode: string) => {
    if (!Array.isArray(commonCodes)) {
      console.warn('commonCodes is not an array:', commonCodes);
      return [];
    }

    return commonCodes
      .filter(code => code.groupCode === groupCode && code.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(code => ({
        value: code.code,
        label: code.codeName,
      }));
  }, [commonCodes]);

  // Reset form when mode changes to create
  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        positionName: '',
        writeDeptCd: '',
        ownerDepts: [],
        mainMeetings: [],
      });
    }
  }, [mode]);

  // Data Fetching
  useEffect(() => {
    const fetchPosition = async () => {
      if (positionId && open && mode !== 'create') {
        try {
          setLoading(true);
          // TODO: API 호출로 직책 데이터 조회
          const mockData = {
            positionName: '테스트 직책',
            writeDeptCd: 'DEPT001',
            ownerDepts: [{ id: '1', deptCode: 'DEPT002', deptName: '테스트 부서' }],
            mainMeetings: [{ id: '1', meetingCode: 'MEET001', meetingName: '테스트 회의체' }],
          };
          setFormData(mockData);
        } catch (err) {
          console.error('직책 조회 실패:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPosition();
  }, [positionId, open, mode]);

  // Form Validation
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.positionName.trim()) {
      errors.positionName = '직책명을 입력해주세요.';
    }
    if (!formData.writeDeptCd) {
      errors.writeDeptCd = '작성부서를 선택해주세요.';
    }

    formData.ownerDepts.forEach((dept, index) => {
      if (!dept.deptCode) {
        errors[`ownerDept_${index}`] = '소관부서를 선택해주세요.';
      }
    });

    formData.mainMeetings.forEach((meeting, index) => {
      if (!meeting.meetingCode) {
        errors[`mainMeeting_${index}`] = '주관회의체를 선택해주세요.';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Event Handlers
  const handleDepartmentSelect = useCallback((selectedDept: Department | Department[]) => {
    if (!Array.isArray(selectedDept)) {
      const newId = String(formData.ownerDepts.length + 1);
      setFormData(prev => ({
        ...prev,
        ownerDepts: [
          ...prev.ownerDepts,
          {
            id: newId,
            deptCode: selectedDept.deptCode,
            deptName: selectedDept.deptName
          }
        ],
      }));
    }
    setDeptSearchOpen(false);
    setCurrentOwnerDeptId(null);
  }, [formData.ownerDepts.length]);

  // 회의체 검색 다이얼로그 열기
  const handleOpenMeetingSearch = () => {
    setMeetingSearchOpen(true);
  };

  // 회의체 선택 처리
  const handleMeetingSelect = (meeting: MeetingBodySearchResult) => {
    setFormData(prev => ({
      ...prev,
      mainMeetings: [...(prev.mainMeetings || []), {
        id: meeting.id,
        meetingCode: meeting.code,
        meetingName: meeting.name
      }],
    }));
    setMeetingSearchOpen(false);
  };

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSave();
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('직책 저장 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [validateForm, onSave, onClose]);

  // Input Handler
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleRemoveOwnerDept = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      ownerDepts: prev.ownerDepts.filter(dept => dept.id !== id),
    }));
  }, []);

  const handleRemoveMainMeeting = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      mainMeetings: prev.mainMeetings.filter(meeting => meeting.id !== id),
    }));
  }, []);

  return (
    <>
      <BaseDialog
        open={open}
        mode={mode}
        title={mode === 'create' ? '직책 등록' : mode === 'edit' ? '직책 수정' : '직책 상세'}
        onClose={onClose}
        onSave={handleSave}
        onModeChange={onChangeMode}
        loading={loading}
      >
        <Box component="form" noValidate sx={{ mt: 2 }}>
          {/* 기본 정보 섹션 */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            기본 정보
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, mb: 4 }}>
            <TextField
              fullWidth
              label="직책명"
              value={formData.positionName}
              onChange={(e) => handleInputChange('positionName', e.target.value)}
              error={!!validationErrors.positionName}
              helperText={validationErrors.positionName}
              disabled={mode === 'view'}
            />
            <FormControl fullWidth error={!!validationErrors.writeDeptCd}>
              <ComboBox
                options={getFilteredCodes('DEPT_CD')}
                // value={formData.writeDeptCd}
                onChange={(e) => handleInputChange('writeDeptCd', e as string)}
                label="작성부서"
                disabled={mode === 'view'}
              />
                {/* {getFilteredCodes('DEPT_CD').map((code) => (
                  <MenuItem key={code.value} value={code.value}>
                    {code.label}
                  </MenuItem>
                ))} */}
            </FormControl>
          </Box>

          {/* 소관부서 섹션 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              소관부서
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>부서코드</TableCell>
                    <TableCell>부서명</TableCell>
                    <TableCell align="center" width={100}>
                      관리
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.ownerDepts.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>{dept.deptCode || '-'}</TableCell>
                      <TableCell>{dept.deptName || '-'}</TableCell>
                      <TableCell align="center">
                        {mode !== 'view' && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveOwnerDept(dept.id)}
                            disabled={loading}
                          >
                            <RemoveIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {mode !== 'view' && (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary' }}>
                        새 부서를 추가하려면 검색 버튼을 클릭하세요
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => setDeptSearchOpen(true)}
                          disabled={loading}
                        >
                          <SearchIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* 주관회의체 섹션 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              주관회의체
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>회의체 코드</TableCell>
                    <TableCell>회의체명</TableCell>
                    <TableCell align="center" width={100}>
                      관리
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.mainMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>{meeting.meetingCode || '-'}</TableCell>
                      <TableCell>{meeting.meetingName || '-'}</TableCell>
                      <TableCell align="center">
                        {mode !== 'view' && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveMainMeeting(meeting.id)}
                            disabled={loading}
                          >
                            <RemoveIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {mode !== 'view' && (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary' }}>
                        새 회의체를 추가하려면 검색 버튼을 클릭하세요
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={handleOpenMeetingSearch}
                          disabled={loading}
                        >
                          <SearchIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </BaseDialog>

      {/* 부서 검색 팝업 */}
      <DepartmentSearchPopup
        open={deptSearchOpen}
        onClose={() => {
          setDeptSearchOpen(false);
          setCurrentOwnerDeptId(null);
        }}
        onSelect={handleDepartmentSelect}
      />

      {/* 회의체 검색 팝업 */}
      <MeetingBodySearchDialog
        open={meetingSearchOpen}
        onClose={() => setMeetingSearchOpen(false)}
        onSelect={handleMeetingSelect}
        excludeIds={formData.mainMeetings?.map(meeting => meeting.id) || []}
      />

      {/* 성공 알림 */}
      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={2000}
        onClose={() => setShowSuccessAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setShowSuccessAlert(false)}>
          {mode === 'create' ? '등록되었습니다.' : '수정되었습니다.'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PositionDialog;
