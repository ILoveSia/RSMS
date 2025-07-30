/**
 * 검색 조건 패널 공통 컴포넌트
 * 
 * 단일 책임 원칙(SRP): 검색 조건 UI 렌더링만 담당
 * 개방-폐쇄 원칙(OCP): 새로운 검색 조건 추가 시 확장 가능
 * 리스코프 치환 원칙(LSP): React.FC 인터페이스를 준수
 * 인터페이스 분리 원칙(ISP): 필요한 props만 정의
 * 의존성 역전 원칙(DIP): 구체적인 구현이 아닌 추상화에 의존
 */

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';

/**
 * 검색 조건 패널 Props 인터페이스
 */
export interface SearchConditionPanelProps {
  /** 검색 조건 컴포넌트들 */
  children: ReactNode;
  /** CSS 클래스명 */
  className?: string;
  /** 추가 스타일 */
  sx?: object;
  /** 패널 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 검색 조건 패널 컴포넌트
 * 
 * 주요 기능:
 * - 일관된 검색 조건 영역 UI 제공
 * - 은행 디자인 시스템 적용
 * - 반응형 레이아웃 지원
 * - 커스텀 스타일링 지원
 */
const SearchConditionPanel: React.FC<SearchConditionPanelProps> = ({
  children,
  className,
  sx = {},
  disabled = false,
}) => {
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        mb: 2,
        bgcolor: disabled ? 'var(--bank-bg-disabled)' : 'var(--bank-bg-secondary)',
        borderRadius: 1,
        border: '1px solid var(--bank-border)',
        alignItems: 'center',
        flexWrap: 'wrap',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default SearchConditionPanel;