/**
 * 도메인 페이지들을 위한 공통 페이지 헤더 컴포넌트
 * 페이지 제목, 설명, 액션 버튼 등을 일관된 스타일로 제공
 */
import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/system';
import React from 'react';

interface PageHeaderProps {
  /** 페이지 제목 */
  title: string;
  /** 페이지 설명 */
  description?: string;
  /** 제목 앞에 표시할 아이콘 */
  icon?: React.ReactNode;
  /** 헤더 우측에 표시할 액션 버튼들 */
  actions?: React.ReactNode;
  /** 헤더 하단에 표시할 추가 컨텐츠 */
  children?: React.ReactNode;
  /** Paper 컴포넌트 사용 여부 */
  elevation?: boolean;
  /** 커스텀 스타일 */
  sx?: SxProps<Theme>;
}

/**
 * 도메인 페이지들을 위한 공통 헤더 컴포넌트
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="회의체 현황"
 *   description="회의체 현황을 조회하고 관리하는 페이지입니다."
 *   icon={<BusinessIcon />}
 *   actions={<Button variant="contained">추가</Button>}
 * />
 * ```
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  children,
  elevation = true,
  sx,
}) => {
  const headerStyles: SxProps<Theme> = {
    px: 3,
    py: 2,
    backgroundColor: 'var(--bank-bg-secondary)',
    borderBottom: '1px solid var(--bank-border)',
    position: 'relative',
    zIndex: 'auto',
    width: '100%',
    boxSizing: 'border-box',
    ...sx,
  };

  const iconStyles: SxProps<Theme> = {
    color: 'var(--bank-primary)',
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: 'var(--bank-primary-bg)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const titleStyles: SxProps<Theme> = {
    fontWeight: 600,
    color: 'var(--bank-text-primary)',
    mb: description ? 0.25 : 0,
    lineHeight: 1.2,
  };

  const descriptionStyles: SxProps<Theme> = {
    color: 'var(--bank-text-secondary)',
    mt: 0.25,
    lineHeight: 1.4,
  };

  const paperStyles: SxProps<Theme> = {
    mb: 2,
    borderRadius: 1,
    border: '1px solid var(--bank-border)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 'auto',
    width: '100%',
    boxSizing: 'border-box',
  };

  const content = (
    <Box sx={headerStyles as any}>
      <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2}>
        <Stack direction='row' alignItems='center' spacing={1.5}>
          {icon && <Box sx={iconStyles as any}>{icon}</Box>}
          <Box>
            <Typography variant='h5' component='h1' sx={titleStyles as any}>
              {title}
            </Typography>
            {description && (
              <Typography variant='body2' sx={descriptionStyles as any}>
                {description}
              </Typography>
            )}
          </Box>
        </Stack>

        {actions && <Box>{actions}</Box>}
      </Stack>

      {children && (
        <>
          <Divider sx={{ my: 1.5, borderColor: 'var(--bank-border)' }} />
          {children}
        </>
      )}
    </Box>
  );

  if (elevation) {
    return (
      <Paper elevation={0} sx={paperStyles as any}>
        {content}
      </Paper>
    );
  }

  return content;
};

export default PageHeader;
