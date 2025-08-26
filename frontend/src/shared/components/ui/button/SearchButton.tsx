/**
 * 조회 버튼 컴포넌트
 * 검색 조건과 함께 사용되는 파란색 계열의 조회 버튼입니다.
 */
import React from 'react';
import { Button, useTheme } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import { Search as SearchIcon } from '@mui/icons-material';

export interface SearchButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick: () => void;
  loading?: boolean;
  loadingText?: string;
  text?: string;
}

/**
 * 조회 버튼 컴포넌트
 */
const SearchButton: React.FC<SearchButtonProps> = ({
  onClick,
  loading = false,
  loadingText = '조회중...',
  text = '조회',
  disabled,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Button
      variant="contained"
      color="primary"
      size="small"
      startIcon={<SearchIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      sx={{
        height: '32px',
        minWidth: '80px',
        fontSize: '0.875rem',
        fontWeight: 600,
        backgroundColor: isDark ? '#4A7BA7' : '#2C5282', // 다크모드 대응
        '&:hover': {
          backgroundColor: isDark ? '#5A8BB7' : '#1A3A52',
        },
        '&:active': {
          backgroundColor: isDark ? '#6B9AC4' : '#152A3E',
        },
        ...sx,
      }}
      {...props}
    >
      {loading ? loadingText : text}
    </Button>
  );
};

export default SearchButton;