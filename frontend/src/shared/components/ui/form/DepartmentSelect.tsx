/**
 * 부서 선택 컴포넌트
 * - POST 방식 부서 검색 지원
 * - 검색 팝업을 통한 부서 선택
 * - 로딩 상태 및 에러 처리
 */
import TextField from '@/shared/components/ui/data-display/TextField';
import IconButton from '@mui/material/IconButton';
import type { SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import DepartmentSearchPopup, { type Department } from '@/domains/common/components/search/DepartmentSearchPopup';

// 부서 검색 요청 타입
export interface DepartmentSearchRequest {
  deptCode?: string;
  deptName?: string;
  page?: number;
  size?: number;
}

// 부서 검색 결과 타입 (DepartmentSearchPopup의 Department 타입 사용)
export type DepartmentSearchResult = Department;

export interface DepartmentSelectProps {
  /** 선택된 부서 정보 */
  value?: DepartmentSearchResult | null;
  /** 값 변경 핸들러 */
  onChange: (value: DepartmentSearchResult | null) => void;
  /** 컴포넌트 크기 */
  size?: 'small' | 'medium';
  /** 커스텀 스타일 */
  sx?: SxProps<Theme>;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 에러 상태 */
  error?: boolean;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 최소 너비 */
  minWidth?: number | string;
  /** 최대 너비 */
  maxWidth?: number | string;
  /** 초기 검색 조건 */
  initialSearchParams?: DepartmentSearchRequest;
  /** 에러 발생 콜백 */
  searchParams?: DepartmentSearchRequest;
  onError?: (error: string) => void;
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  value = null,
  onChange,
  size = 'small',
  sx,
  placeholder = '부서를 선택하세요',
  disabled = false,
  error = false,
  helperText,
  minWidth = 200,
  maxWidth = 300,
  searchParams,
  initialSearchParams,
  onError,
}) => {
  const [departmentSearchPopupOpen, setDepartmentSearchPopupOpen] = useState<boolean>(false);

  const handleSearch = useCallback(() => {
    setDepartmentSearchPopupOpen(true);
  }, []);

  // 부서 선택 핸들러
  const handleSelect = useCallback((department: DepartmentSearchResult | DepartmentSearchResult[]) => {
    // 단일 선택만 지원하므로 배열인 경우 첫 번째 항목 사용
    const selectedDept = Array.isArray(department) ? department[0] : department;
    onChange(selectedDept);
    setDepartmentSearchPopupOpen(false);
  }, [onChange]);

  // 부서 선택 해제 핸들러
  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
      <TextField
        value={value?.deptName || ''}
        size={size}
        disabled={disabled}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        sx={{ minWidth, maxWidth }}
        InputProps={{
          readOnly: true,
          endAdornment: value && (
            <IconButton size="small" onClick={handleClear} disabled={disabled}>
              ×
            </IconButton>
          ),
        }}
      />
      <IconButton onClick={handleSearch} disabled={disabled}>
        <SearchIcon />
      </IconButton>
      <DepartmentSearchPopup
        open={departmentSearchPopupOpen}
        onClose={() => setDepartmentSearchPopupOpen(false)}
        onSelect={handleSelect}
        title="부서 선택"
        multiSelect={false}
      />
    </Box>
  );
};

export default DepartmentSelect;