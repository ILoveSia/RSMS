import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { Box, Breadcrumbs, Link, Typography, useTheme } from '@mui/material';
import { forwardRef } from 'react';
import { BreadcrumbItem, BreadcrumbProps } from './types';

/**
 * Breadcrumb 컴포넌트
 *
 * Material-UI Breadcrumbs를 기반으로 한 브레드크럼 컴포넌트
 * 네비게이션 경로를 표시하고 클릭 이벤트를 제공
 *
 * @example
 * ```tsx
 * const breadcrumbItems = [
 *   { id: 'home', label: '홈', href: '/', icon: <HomeIcon /> },
 *   { id: 'users', label: '사용자 관리', href: '/users' },
 *   { id: 'detail', label: '사용자 상세' }
 * ];
 *
 * <Breadcrumb items={breadcrumbItems} />
 *
 * // 축약된 브레드크럼
 * <Breadcrumb
 *   items={longBreadcrumbItems}
 *   maxItems={4}
 *   itemsBeforeCollapse={2}
 *   itemsAfterCollapse={2}
 * />
 * ```
 */
const Breadcrumb = forwardRef<HTMLDivElement, BreadcrumbProps>(
  (
    {
      items,
      separator = <NavigateNextIcon fontSize='small' />,
      maxItems = 8,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse = 1,
      expandText = '...',
      renderItem,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    // 개별 아이템 렌더링
    const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
      if (renderItem) {
        return renderItem(item, index);
      }

      const itemContent = (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {item.icon}
          <Typography
            variant='body2'
            color={isLast ? 'text.primary' : 'inherit'}
            sx={{ fontWeight: isLast ? 500 : 400 }}
          >
            {item.label}
          </Typography>
        </Box>
      );

      // 마지막 아이템은 링크가 아닌 텍스트로 표시
      if (isLast) {
        return (
          <Typography
            key={item.id}
            color='text.primary'
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            {itemContent}
          </Typography>
        );
      }

      // 클릭 이벤트가 있는 경우
      if (item.onClick) {
        return (
          <Link
            key={item.id}
            component='button'
            variant='body2'
            color='inherit'
            onClick={item.onClick}
            disabled={item.disabled}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textDecoration: 'none',
              border: 'none',
              background: 'none',
              cursor: item.disabled ? 'default' : 'pointer',
              '&:hover': !item.disabled && {
                textDecoration: 'underline',
              },
              '&:disabled': {
                color: theme.palette.text.disabled,
                cursor: 'default',
              },
            }}
          >
            {itemContent}
          </Link>
        );
      }

      // href가 있는 경우
      if (item.href) {
        return (
          <Link
            key={item.id}
            href={item.href}
            variant='body2'
            color='inherit'
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {itemContent}
          </Link>
        );
      }

      // 일반 텍스트
      return (
        <Typography
          key={item.id}
          variant='body2'
          color='inherit'
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          {itemContent}
        </Typography>
      );
    };

    return (
      <Breadcrumbs
        ref={ref}
        separator={separator}
        maxItems={maxItems}
        itemsBeforeCollapse={itemsBeforeCollapse}
        itemsAfterCollapse={itemsAfterCollapse}
        expandText={expandText}
        className={className}
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: theme.palette.text.secondary,
          },
          ...sx,
        }}
        {...props}
      >
        {items.map((item, index) => renderBreadcrumbItem(item, index, index === items.length - 1))}
      </Breadcrumbs>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
