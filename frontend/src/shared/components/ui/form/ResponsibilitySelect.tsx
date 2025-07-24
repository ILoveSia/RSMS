/**
 * 책무 선택 컴포넌트
 * - POST 방식 책무 검색 지원
 * - 검색 팝업을 통한 책무 선택
 * - 로딩 상태 및 에러 처리
 */
import TextField from '@/shared/components/ui/data-display/TextField';
import IconButton from '@mui/material/IconButton';
import type { SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ResponsibilitySearchPopup, { type ResponsibilitySearchResult } from '@/domains/common/components/search/ResponsibilitySearchPopup';

export interface ResponsibilitySelectProps {
  /** 선택된 책무 정보 */
  value?: ResponsibilitySearchResult | null;
  /** 값 변경 핸들러 */
  onChange: (value: ResponsibilitySearchResult | null) => void;
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
  /** 에러 발생 콜백 */
  onError?: (error: string) => void;
}
const ResponsibilitySelect: React.FC<ResponsibilitySelectProps> = ({
  value = null,
  onChange,
  size = 'small',
  sx,
  placeholder = '책무를 선택하세요',
  disabled = false,
  error = false,
  helperText,
  minWidth = 200,
  maxWidth = 300,
  onError,
}) => {
  const [responsibilitySearchPopupOpen, setResponsibilitySearchPopupOpen] = useState<boolean>(false);

  const handleSearch = useCallback(() => {
    setResponsibilitySearchPopupOpen(true);
  }, []);

  // 책무 선택 핸들러
  const handleSelect = useCallback((responsibility: ResponsibilitySearchResult) => {
    onChange(responsibility);
    setResponsibilitySearchPopupOpen(false);
  }, [onChange]);

  // 책무 선택 해제 핸들러
  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
      <TextField
        value={value?.responsibilityContent || ''}
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
      <ResponsibilitySearchPopup
        open={responsibilitySearchPopupOpen}
        onClose={() => setResponsibilitySearchPopupOpen(false)}
        onSelect={handleSelect}
      />
    </Box>
  );
};

export default ResponsibilitySelect;
