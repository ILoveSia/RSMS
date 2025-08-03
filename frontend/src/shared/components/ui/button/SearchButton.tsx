/**
 * 조회 버튼 컴포넌트
 * 검색 조건과 함께 사용되는 파란색 계열의 조회 버튼입니다.
 */
import React from 'react';
import { Button } from '@mui/material';
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
        backgroundColor: '#1976d2', // 파란색 계열
        '&:hover': {
          backgroundColor: '#1565c0',
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