import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { Box, Pagination as MuiPagination, PaginationItem, useTheme } from '@mui/material';
import React, { forwardRef } from 'react';
import type { PaginationProps as PaginationPropsType } from './types';

// Pagination 컴포넌트 자체 타입 정의
export interface PaginationProps extends PaginationPropsType {}

/**
 * Pagination 컴포넌트
 *
 * Material-UI Pagination을 기반으로 한 페이지네이션 컴포넌트
 * 다양한 스타일, 크기, 모양 옵션을 제공
 *
 * @example
 * ```tsx
 * // 기본 페이지네이션
 * <Pagination
 *   count={10}
 *   page={1}
 *   onChange={handlePageChange}
 * />
 *
 * // 커스텀 스타일
 * <Pagination
 *   count={20}
 *   page={5}
 *   onChange={handlePageChange}
 *   variant="outlined"
 *   shape="rounded"
 *   size="large"
 *   showFirstButton
 *   showLastButton
 * />
 *
 * // 컴팩트 버전
 * <Pagination
 *   count={50}
 *   page={25}
 *   onChange={handlePageChange}
 *   size="small"
 *   siblingCount={1}
 *   boundaryCount={1}
 * />
 * ```
 */
const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      count,
      page,
      onChange,
      variant = 'text',
      shape = 'circular',
      size = 'medium',
      color = 'primary',
      disabled = false,
      hideNextButton = false,
      hidePrevButton = false,
      showFirstButton = false,
      showLastButton = false,
      siblingCount = 1,
      boundaryCount = 1,
      renderItem,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    // 페이지 변경 핸들러
    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
      onChange(value);
    };

    // 커스텀 아이템 렌더링
    const customRenderItem =
      renderItem ||
      (item => {
        const iconMap = {
          first: <FirstPageIcon />,
          last: <LastPageIcon />,
          previous: <NavigateBeforeIcon />,
          next: <NavigateNextIcon />,
        };

        return (
          <PaginationItem
            {...item}
            slots={{
              first: FirstPageIcon,
              last: LastPageIcon,
              previous: NavigateBeforeIcon,
              next: NavigateNextIcon,
            }}
          />
        );
      });

    return (
      <Box
        ref={ref}
        className={className}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          ...sx,
        }}
        {...props}
      >
        <MuiPagination
          count={count}
          page={page}
          onChange={handleChange}
          variant={variant}
          shape={shape}
          size={size}
          color={color}
          disabled={disabled}
          hideNextButton={hideNextButton}
          hidePrevButton={hidePrevButton}
          showFirstButton={showFirstButton}
          showLastButton={showLastButton}
          siblingCount={siblingCount}
          boundaryCount={boundaryCount}
          renderItem={customRenderItem}
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.875rem',
              minWidth: size === 'small' ? 26 : size === 'large' ? 40 : 32,
              height: size === 'small' ? 26 : size === 'large' ? 40 : 32,
            },
            '& .MuiPaginationItem-page': {
              fontWeight: 500,
            },
            '& .MuiPaginationItem-page.Mui-selected': {
              fontWeight: 600,
              ...(variant === 'text' && {
                backgroundColor: theme.palette[color].main,
                color: theme.palette[color].contrastText,
                '&:hover': {
                  backgroundColor: theme.palette[color].dark,
                },
              }),
            },
          }}
        />
      </Box>
    );
  }
);

Pagination.displayName = 'Pagination';

export default Pagination;
