/**
 * 직원 선택 컴포넌트
 * 직원 검색 및 선택 기능을 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직원 선택만 담당
 * - Open/Closed: 새로운 검색 옵션이나 필터 추가 시 확장 가능
 * - Liskov Substitution: React 컴포넌트 인터페이스 준수
 * - Interface Segregation: 직원 선택 관련 기능만 제공
 * - Dependency Inversion: Material-UI Autocomplete에 의존
 */

import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Avatar,
  Chip,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

// 직원 정보 타입
export interface Employee {
  empNo: string;
  name: string;
  dept: string;
  position?: string;
  email?: string;
}

interface EmployeeSelectorProps {
  label?: string;
  placeholder?: string;
  value?: Employee | null;
  onChange: (employee: Employee | null) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  size?: 'small' | 'medium';
  departmentFilter?: string;
  positionFilter?: string;
}

// Mock 데이터 - 실제로는 API에서 가져옴
const mockEmployees: Employee[] = [
  { empNo: 'E001', name: '김인계', dept: '정보기술부', position: '부서장', email: 'kim@company.com' },
  { empNo: 'E002', name: '이인수', dept: '정보기술부', position: '팀장', email: 'lee@company.com' },
  { empNo: 'E003', name: '박관리', dept: '경영관리부', position: '부서장', email: 'park@company.com' },
  { empNo: 'E004', name: '최선임', dept: '리스크관리부', position: '선임', email: 'choi@company.com' },
  { empNo: 'E005', name: '정개발', dept: '정보기술부', position: '선임', email: 'jung@company.com' },
  { empNo: 'E006', name: '조분석', dept: '경영관리부', position: '팀장', email: 'jo@company.com' },
  { empNo: 'E007', name: '한보안', dept: '보안부', position: '부서장', email: 'han@company.com' },
  { empNo: 'E008', name: '윤감사', dept: '감사부', position: '선임', email: 'yoon@company.com' },
];

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  label = '직원 선택',
  placeholder = '이름, 사번, 부서로 검색',
  value,
  onChange,
  error = false,
  helperText,
  required = false,
  disabled = false,
  multiple = false,
  size = 'medium',
  departmentFilter,
  positionFilter,
}) => {
  const [options, setOptions] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // 직원 목록 로드
  useEffect(() => {
    loadEmployees();
  }, [departmentFilter, positionFilter]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출로 대체
      // const response = await EmployeeApi.searchEmployees({
      //   department: departmentFilter,
      //   position: positionFilter,
      // });
      
      // Mock 데이터 필터링
      let filteredEmployees = mockEmployees;
      
      if (departmentFilter) {
        filteredEmployees = filteredEmployees.filter(emp => 
          emp.dept.includes(departmentFilter)
        );
      }
      
      if (positionFilter) {
        filteredEmployees = filteredEmployees.filter(emp => 
          emp.position?.includes(positionFilter)
        );
      }
      
      setOptions(filteredEmployees);
    } catch (error) {
      console.error('직원 목록 로드 실패:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 필터링
  const getFilteredOptions = (inputValue: string) => {
    if (!inputValue) return options;
    
    const searchTerm = inputValue.toLowerCase();
    return options.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm) ||
      employee.empNo.toLowerCase().includes(searchTerm) ||
      employee.dept.toLowerCase().includes(searchTerm) ||
      employee.position?.toLowerCase().includes(searchTerm)
    );
  };

  // 옵션 표시 레이블
  const getOptionLabel = (option: Employee) => {
    return `${option.name} (${option.empNo}) - ${option.dept}`;
  };

  // 옵션 렌더링
  const renderOption = (props: any, option: Employee) => (
    <Box component="li" {...props}>
      <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
        {option.name.charAt(0)}
      </Avatar>
      <Box>
        <Typography variant="body1">{option.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {option.empNo} | {option.dept}
          {option.position && ` | ${option.position}`}
        </Typography>
      </Box>
    </Box>
  );

  // 태그 렌더링 (다중 선택 시)
  const renderTags = (tagValue: Employee[], getTagProps: any) =>
    tagValue.map((option, index) => (
      <Chip
        {...getTagProps({ index })}
        key={option.empNo}
        label={`${option.name} (${option.empNo})`}
        size={size}
        avatar={<Avatar sx={{ width: 20, height: 20 }}>{option.name.charAt(0)}</Avatar>}
      />
    ));

  return (
    <Autocomplete
      options={getFilteredOptions(inputValue)}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      renderTags={multiple ? renderTags : undefined}
      loading={loading}
      disabled={disabled}
      multiple={multiple as any}
      size={size}
      isOptionEqualToValue={(option, value) => option.empNo === value.empNo}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          required={required}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <PersonIcon color="action" />
                )}
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText="검색 결과가 없습니다"
      loadingText="검색 중..."
    />
  );
};

export default EmployeeSelector;