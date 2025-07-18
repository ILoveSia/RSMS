/**
 * 도메인 페이지들을 위한 공통 페이지 컨테이너 컴포넌트
 * 일관된 페이지 레이아웃과 스타일링을 제공
 */
import { Container } from '@mui/material';
import type { SxProps, Theme } from '@mui/system';
import React, { useEffect, useState } from 'react';

interface PageContainerProps {
  /** 페이지 내용 */
  children: React.ReactNode;
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  /** 패딩 제거 여부 */
  disablePadding?: boolean;
  /** 커스텀 스타일 */
  sx?: SxProps<Theme>;
  /** 최대 너비 설정 */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /** 너비 설정 */
  width?: number | string;
}

/**
 * 도메인 페이지들을 위한 공통 컨테이너 컴포넌트
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <PageHeader title="페이지 제목" />
 *   <PageContent>
 *     // 페이지 내용
 *   </PageContent>
 * </PageContainer>
 * ```
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  width = '100%',
  fullWidth = false,
  disablePadding = false,
  maxWidth = '100%',
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
    py: disablePadding ? 0 : 3,
    px: disablePadding ? 0 : 2,
    minHeight: 'calc(100vh - 64px)', // 기본 높이 (헤더 높이 제외)
  };

  const tabStyles: SxProps<Theme> = {
    height: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <Container
      maxWidth={fullWidth ? false : maxWidth}
      disableGutters={disablePadding}
      sx={{
        ...(baseStyles as any),
        ...(isInTab ? (tabStyles as any) : {}),
        ...(sx as any),
      }}
    >
      {children}
    </Container>
  );
};

export default PageContainer;
