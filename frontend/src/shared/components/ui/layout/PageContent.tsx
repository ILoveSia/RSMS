/**
 * 도메인 페이지들을 위한 공통 페이지 컨텐츠 컴포넌트
 * 페이지 본문 영역을 일관된 스타일로 제공
 */
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/system';
import React, { useEffect, useState } from 'react';

interface PageContentProps {
  /** 페이지 컨텐츠 */
  children: React.ReactNode;
  /** 최대 너비 제한 */
  maxWidth?: number | string;
  /** 패딩 제거 여부 */
  disablePadding?: boolean;
  /** 커스텀 스타일 */
  sx?: SxProps<Theme>;
}

/**
 * 도메인 페이지들을 위한 공통 컨텐츠 컴포넌트
 *
 * @example
 * ```tsx
 * <PageContent>
 *   <Card>
 *     // 페이지 내용
 *   </Card>
 * </PageContent>
 * ```
 */
export const PageContent: React.FC<PageContentProps> = ({
  children,
  maxWidth,
  disablePadding = false,
  sx,
}) => {
  const [isInTab, setIsInTab] = useState(false);

  useEffect(() => {
    // 탭 시스템 내부에 있는지 확인
    const checkIfInTab = () => {
      const element = document.querySelector('[role="tabpanel"]');
      setIsInTab(!!element);
    };

    checkIfInTab();

    // DOM 변경 감지를 위한 MutationObserver
    const observer = new MutationObserver(checkIfInTab);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const baseStyles: SxProps<Theme> = {
    width: '100%',
    maxWidth: maxWidth || 'none',
    mx: maxWidth ? 'auto' : 0,
    px: disablePadding ? 0 : 0,
  };

  const tabStyles: SxProps<Theme> = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  };

  return (
    <Box
      sx={{
        ...(baseStyles as any),
        ...(isInTab ? (tabStyles as any) : {}),
        ...(sx as any),
      }}
    >
      {children}
    </Box>
  );
};

export default PageContent;
