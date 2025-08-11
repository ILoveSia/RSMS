/**
 * 직원 선택 컴포넌트 (DepartmentSelect와 동일 패턴)
 * - 검색 팝업을 통해 사원 선택
 */
import React, { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import type { SxProps, Theme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@/shared/components/ui/data-display/TextField';
import EmployeeSearchPopup, { type EmployeeSearchResult } from '@/domains/common/components/search/EmployeeSearchPopup';

export interface EmployeeSelectProps {
  value?: EmployeeSearchResult | null;
  onChange: (value: EmployeeSearchResult | null) => void;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  minWidth?: number | string;
  maxWidth?: number | string;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  value = null,
  onChange,
  size = 'small',
  sx,
  placeholder = '사원 선택',
  disabled = false,
  error = false,
  helperText,
  minWidth = 200,
  maxWidth = 300,
}) => {
  const [popupOpen, setPopupOpen] = useState<boolean>(false);

  const handleOpen = useCallback(() => setPopupOpen(true), []);
  const handleClose = useCallback(() => setPopupOpen(false), []);
  const handleSelect = useCallback((emp: EmployeeSearchResult) => {
    onChange(emp);
    setPopupOpen(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <Box sx={{ ...sx }}>
      <TextField
        label=""
        mode="editable"
        value={value?.username || ''}
        size={size}
        disabled={disabled}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        sx={{ minWidth, maxWidth }}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {value && (
                <IconButton size="small" onClick={handleClear} disabled={disabled}>
                  ×
                </IconButton>
              )}
              <IconButton size="small" onClick={handleOpen} disabled={disabled}>
                <SearchIcon />
              </IconButton>
            </Box>
          ),
        }}
      />

      <EmployeeSearchPopup
        open={popupOpen}
        onClose={handleClose}
        onSelect={handleSelect}
        title="사원 검색"
      />
    </Box>
  );
};

export default EmployeeSelect;
