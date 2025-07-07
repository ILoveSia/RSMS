/**
 * 임원 등록 다이얼로그 컴포넌트
 * 기본 정보 입력, 그리드 형태의 세부 정보 입력을 제공합니다.
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  IconButton,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import Dialog from './Dialog';
import EmployeeSearchPopup from './EmployeeSearchPopup';
import type { EmployeeSearchResult } from './EmployeeSearchPopup';

export interface ExecutiveRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: ExecutiveRegistrationData) => void;
}

export interface GridRowData {
  id: string;
  meetingName: string;
  memberType: string;
  meetingFrequency: string;
  mainAgenda: string;
}

export interface DepartmentData {
  id: string;
  departmentCode: string;
  department: string;
}

export interface ExecutiveRegistrationData {
  position: string;
  name: string;
  jobTitle: string;
  appointmentDate: string;
  executiveAppointmentDate: string;
  hasConcurrentPosition: boolean;
  concurrentDetails: string;
  departmentData: DepartmentData[];
  gridData: GridRowData[];
}

const ExecutiveRegistrationDialog: React.FC<ExecutiveRegistrationDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<{
    position: string;
    name: string;
    jobTitle: string;
    appointmentDate: string;
    executiveAppointmentDate: string;
    hasConcurrentPosition: boolean;
    concurrentDetails: string;
  }>({
    position: '',
    name: '',
    jobTitle: '',
    appointmentDate: '',
    executiveAppointmentDate: '',
    hasConcurrentPosition: false,
    concurrentDetails: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [searchPopupOpen, setSearchPopupOpen] = useState(false);
  const [concurrentPositionSelected, setConcurrentPositionSelected] = useState(false);

  // 초기 그리드 데이터 - 이미지와 유사한 구조
  const [gridData, setGridData] = useState<GridRowData[]>([
    {
      id: '1',
      meetingName: '',
      memberType: '',
      meetingFrequency: '',
      mainAgenda: ''
    },
    {
      id: '2',
      meetingName: '',
      memberType: '',
      meetingFrequency: '',
      mainAgenda: ''
    },
    {
      id: '3',
      meetingName: '',
      memberType: '',
      meetingFrequency: '',
      mainAgenda: ''
    },
    {
      id: '4',
      meetingName: '',
      memberType: '',
      meetingFrequency: '',
      mainAgenda: ''
    },
    {
      id: '5',
      meetingName: '',
      memberType: '',
      meetingFrequency: '',
      mainAgenda: ''
    }
  ]);

  // 소관부서 데이터
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([
    {
      id: '1',
      departmentCode: '',
      department: ''
    },
    {
      id: '2',
      departmentCode: '',
      department: ''
    },
    {
      id: '3',
      departmentCode: '',
      department: ''
    }
  ]);

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 검증 에러 제거
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 겸직여부 변경 핸들러
  const handleConcurrentPositionChange = (value: boolean) => {
    setFormData(prev => ({
      ...prev,
      hasConcurrentPosition: value,
      // 겸직여부가 false가 되면 겸직사항도 초기화
      concurrentDetails: value ? prev.concurrentDetails : ''
    }));
    
    // 겸직여부가 선택되었음을 표시
    setConcurrentPositionSelected(true);
    
    // 검증 에러 제거
    if (validationErrors.hasConcurrentPosition) {
      setValidationErrors(prev => ({
        ...prev,
        hasConcurrentPosition: ''
      }));
    }
    if (!value && validationErrors.concurrentDetails) {
      setValidationErrors(prev => ({
        ...prev,
        concurrentDetails: ''
      }));
    }
  };

  // 그리드 데이터 변경 핸들러
  const handleGridChange = (id: string, field: keyof GridRowData, value: string) => {
    setGridData(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // 소관부서 데이터 변경 핸들러
  const handleDepartmentChange = (id: string, field: keyof DepartmentData, value: string) => {
    setDepartmentData(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.position.trim()) {
      errors.position = '직책을 입력해주세요.';
    }

    if (!formData.name.trim()) {
      errors.name = '성명을 입력해주세요.';
    }

    if (!formData.jobTitle.trim()) {
      errors.jobTitle = '직위를 입력해주세요.';
    }

    if (!formData.appointmentDate) {
      errors.appointmentDate = '현 직책 부여일을 선택해주세요.';
    }

    if (!formData.executiveAppointmentDate) {
      errors.executiveAppointmentDate = '임원 선임일을 선택해주세요.';
    }

    if (!concurrentPositionSelected) {
      errors.hasConcurrentPosition = '겸직여부를 선택해주세요.';
    }

    if (formData.hasConcurrentPosition && !formData.concurrentDetails.trim()) {
      errors.concurrentDetails = '겸직사항을 입력해주세요.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const registrationData: ExecutiveRegistrationData = {
        position: formData.position,
        name: formData.name,
        jobTitle: formData.jobTitle,
        appointmentDate: formData.appointmentDate,
        executiveAppointmentDate: formData.executiveAppointmentDate,
        hasConcurrentPosition: formData.hasConcurrentPosition,
        concurrentDetails: formData.concurrentDetails,
        departmentData: departmentData,
        gridData: gridData
      };

      if (onSave) {
        await onSave(registrationData);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 버튼 클릭 핸들러
  const handleSearchClick = () => {
    setSearchPopupOpen(true);
  };

  // 사원 검색 팝업 닫기
  const handleSearchPopupClose = () => {
    setSearchPopupOpen(false);
  };

  // 사원 선택 처리
  const handleEmployeeSelect = (employee: EmployeeSearchResult | EmployeeSearchResult[]) => {
    // 단일 선택인 경우 (multiSelect: false)
    if (!Array.isArray(employee)) {
      setFormData(prev => ({
        ...prev,
        name: employee.username
      }));
      
      // 성명 검증 에러 제거
      if (validationErrors.name) {
        setValidationErrors(prev => ({
          ...prev,
          name: ''
        }));
      }
    }
    
    setSearchPopupOpen(false);
  };

  useEffect(() => {
    if (open) {
      setConcurrentPositionSelected(false);
    }
  }, [open]);

  return (
    <>
      <Dialog
        open={open}
        title="임원 등록"
        maxWidth="lg"
        fullWidth
        onClose={onClose}
        disableBackdropClick={loading}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onClose} variant="outlined" disabled={loading}>
              취소
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              저장
            </Button>
          </Box>
        }
      >
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 기본 정보 입력 섹션 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="직책"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  error={!!validationErrors.position}
                  helperText={validationErrors.position}
                  placeholder="직책을 입력하세요"
                />
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  <TextField
                    fullWidth
                    label="성명"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                    placeholder="성명을 입력하세요"
                  />
                  <IconButton
                    onClick={handleSearchClick}
                    sx={{ 
                      ml: 1, 
                      mt: 1,
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'white'
                      }
                    }}
                    title="사용자 검색"
                  >
                    <Search />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="직위"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  error={!!validationErrors.jobTitle}
                  helperText={validationErrors.jobTitle}
                  placeholder="직위를 입력하세요"
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                  <TextField
                    fullWidth
                    label="현 직책 부여일"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                    error={!!validationErrors.appointmentDate}
                    helperText={validationErrors.appointmentDate}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="임원 선임일"
                    type="date"
                    value={formData.executiveAppointmentDate}
                    onChange={(e) => handleInputChange('executiveAppointmentDate', e.target.value)}
                    error={!!validationErrors.executiveAppointmentDate}
                    helperText={validationErrors.executiveAppointmentDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    겸직여부
                  </Typography>
                  <FormControl component="fieldset" error={!!validationErrors.hasConcurrentPosition}>
                    <RadioGroup
                      row
                      value={formData.hasConcurrentPosition.toString()}
                      onChange={(e) => handleConcurrentPositionChange(e.target.value === 'true')}
                    >
                      <FormControlLabel
                        value="true"
                        control={<Radio size="small" />}
                        label="있음"
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                      />
                      <FormControlLabel
                        value="false"
                        control={<Radio size="small" />}
                        label="없음"
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                      />
                    </RadioGroup>
                    {validationErrors.hasConcurrentPosition && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {validationErrors.hasConcurrentPosition}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
                <TextField
                  fullWidth
                  label="겸직사항"
                  value={formData.concurrentDetails}
                  onChange={(e) => handleInputChange('concurrentDetails', e.target.value)}
                  error={!!validationErrors.concurrentDetails}
                  helperText={validationErrors.concurrentDetails}
                  placeholder="겸직사항을 입력하세요"
                  disabled={!formData.hasConcurrentPosition}
                  sx={{ 
                    flex: 1,
                    '& .MuiInputBase-root': {
                      backgroundColor: !formData.hasConcurrentPosition ? '#f5f5f5' : 'transparent',
                      '&.Mui-disabled': {
                        backgroundColor: '#f5f5f5',
                        opacity: 0.7,
                      },
                      '&.Mui-disabled .MuiInputBase-input': {
                        WebkitTextFillColor: '#666666',
                      }
                    },
                    '& .MuiInputLabel-root.Mui-disabled': {
                      color: '#999999',
                    }
                  }}
                />
              </Box>

              {/* 소관부서 섹션 */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 0.3, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    소관부서
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell align="center" sx={{ fontWeight: 'bold', width: '40%' }}>
                            부서코드
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', width: '60%' }}>
                            부서
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {departmentData.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <TextField
                                fullWidth
                                size="small"
                                value={row.departmentCode}
                                onChange={(e) => handleDepartmentChange(row.id, 'departmentCode', e.target.value)}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                size="small"
                                value={row.department}
                                onChange={(e) => handleDepartmentChange(row.id, 'department', e.target.value)}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Box>

            {/* 그리드 섹션 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box sx={{ flex: 0.3, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  주관회의체 정보
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: '25%' }}>
                          회의체명
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>
                          위원장/위원
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>
                          개최주기
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: '35%' }}>
                          주요 심의/의결사항
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gridData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={row.meetingName}
                              onChange={(e) => handleGridChange(row.id, 'meetingName', e.target.value)}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={row.memberType}
                              onChange={(e) => handleGridChange(row.id, 'memberType', e.target.value)}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={row.meetingFrequency}
                              onChange={(e) => handleGridChange(row.id, 'meetingFrequency', e.target.value)}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={row.mainAgenda}
                              onChange={(e) => handleGridChange(row.id, 'mainAgenda', e.target.value)}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* 사원 검색 팝업 */}
      <EmployeeSearchPopup
        open={searchPopupOpen}
        onClose={handleSearchPopupClose}
        onSelect={handleEmployeeSelect}
        title="사원 검색"
        visibleColumns={['num', 'username', 'deptCd']}
        multiSelect={false}
      />
    </>
  );
};

export default ExecutiveRegistrationDialog;
