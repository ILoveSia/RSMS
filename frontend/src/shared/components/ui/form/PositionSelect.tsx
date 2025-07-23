/**
 * 직책 선택 컴포넌트
 * - POST 방식 직책 검색 지원
 * - 검색 팝업을 통한 직책 선택
 * - 로딩 상태 및 에러 처리
 */
import { positionApi, type PositionSearchRequest, type PositionSearchResult } from '@/domains/ledgermngt/api/positionApi';
import TextField from '@/shared/components/ui/data-display/TextField';
import IconButton from '@mui/material/IconButton';
import { PositionSearchPopup } from '@/domains/common/components';
import type { SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';


export interface PositionSelectProps {
  /** 선택된 직책 정보 */
  value?: PositionSearchResult | null;
  /** 값 변경 핸들러 */
  onChange: (value: PositionSearchResult | null) => void;
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
  initialSearchParams?: PositionSearchRequest;
  /** 에러 발생 콜백 */
  onError?: (error: string) => void;
}
const PositionSelect: React.FC<PositionSelectProps> = ({
  value = null,
  onChange,
  size = 'small',
  sx,
  placeholder = '직책을 선택하세요',
  disabled = false,
  error = false,
  helperText,
  minWidth = 200,
  maxWidth = 300,
  initialSearchParams,
  onError,
}) => {
  const [positionSearchPopupOpen, setPositionSearchPopupOpen] = useState<boolean>(false);

  const handleSearch = useCallback(() => {
    setPositionSearchPopupOpen(true);
  }, []);

  // 직책 선택 핸들러
  const handleSelect = useCallback((position: PositionSearchResult) => {
    onChange(position);
    console.log('선택된 직책:', position);
    setPositionSearchPopupOpen(false);
  }, [onChange]);

  // 직책 선택 해제 핸들러
  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
      <TextField
        value={value?.positionsNm || ''}
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
      <PositionSearchPopup
        open={positionSearchPopupOpen}
        onClose={() => setPositionSearchPopupOpen(false)}
        onSelect={handleSelect}
        initialSearchParams={initialSearchParams}
      />
    </Box>
  );
};

export default PositionSelect;
