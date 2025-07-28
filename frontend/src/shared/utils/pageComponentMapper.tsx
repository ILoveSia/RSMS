/**
 * 페이지 컴포넌트 매퍼 유틸리티
 *
 * 책임:
 * - 메뉴 경로에 따른 페이지 컴포넌트 동적 로딩
 * - 컴포넌트 lazy loading
 * - 에러 처리
 */
import { Box, Typography } from '@mui/material';
import type { ComponentType } from 'react';
import React, { lazy } from 'react';

// 페이지 컴포넌트 타입
type PageComponent = ComponentType<any>;

// 페이지 컴포넌트 매핑 타입
type PageComponentMapping = {
  [path: string]: {
    component: () => Promise<{ default: PageComponent }>;
    title: string;
    icon?: string;
  };
};

// 에러 페이지 컴포넌트
const ErrorPage: React.FC<{ error?: string }> = ({ error }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      p: 3,
    }}
  >
    <Typography variant='h6' color='error' gutterBottom>
      페이지를 불러올 수 없습니다
    </Typography>
    <Typography variant='body2' color='text.secondary'>
      {error || '알 수 없는 오류가 발생했습니다.'}
    </Typography>
  </Box>
);

// 준비 중 페이지 컴포넌트
const ComingSoonPage: React.FC<{ title?: string }> = ({ title }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      p: 3,
    }}
  >
    <Typography variant='h5' gutterBottom>
      🚧 준비 중입니다
    </Typography>
    <Typography variant='body1' color='text.secondary'>
      {title ? `${title} 페이지를 준비 중입니다.` : '페이지를 준비 중입니다.'}
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
      빠른 시일 내에 서비스를 제공하겠습니다.
    </Typography>
  </Box>
);

// 페이지 컴포넌트 매핑 설정
const PAGE_COMPONENT_MAPPING: PageComponentMapping = {
  // 루트 경로와 메인 경로를 동일한 컴포넌트로 매핑
  '/': {
    component: () => import('@/domains/main/pages/MainPage'),
    title: '메인',
    icon: 'home',
  },

  // 메인 페이지 (루트 경로와 동일)
  '/main': {
    component: () => import('@/domains/main/pages/MainPage'),
    title: '메인',
    icon: 'home',
  },

  // 장부관리 - 기존 경로 (호환성 유지)
  '/ledgermngt/meeting-status': {
    component: () => import('@/domains/ledgermngt/pages/MeetingStatusPage'),
    title: '회의체 현황',
    icon: 'meeting_room',
  },
  '/ledgermngt/position-status': {
    component: () => import('@/domains/ledgermngt/pages/PositionStatusPage'),
    title: '직책 현황',
    icon: 'person',
  },
  '/ledgermngt/responsibility-db-status': {
    component: () => import('@/domains/ledgermngt/pages/ResponsibilityDbStatusPage'),
    title: '책무DB 현황',
    icon: 'database',
  },
  '/ledgermngt/executive-responsibility': {
    component: () => import('@/domains/ledgermngt/pages/ExecutiveResponsibilityStatusPage'),
    title: '임원별 책무 현황',
    icon: 'Work',
  },

  // 장부관리 - 새로운 경로 (데이터베이스와 일치)
  '/ledger/company-status': {
    component: () => import('@/domains/ledgermngt/pages/MeetingStatusPage'),
    title: '회의체 현황',
    icon: 'meeting_room',
  },
  '/ledger/position-status': {
    component: () => import('@/domains/ledgermngt/pages/PositionStatusPage'),
    title: '직책 현황',
    icon: 'person',
  },
  '/ledger/db-status': {
    component: () => import('@/domains/ledgermngt/pages/ResponsibilityDbStatusPage'),
    title: '책무 DB현황',
    icon: 'database',
  },
  '/ledger/detail-status': {
    component: () => import('@/domains/ledgermngt/pages/PositionResponsibilityStatusPage'),
    title: '직책별 책무 현황',
    icon: 'list_alt',
  },
  '/ledger/business-status': {
    component: () => import('@/domains/ledgermngt/pages/ExecutiveStatusPage'),
    title: '임원 현황',
    icon: 'business_center',
  },
  '/ledger/business-detail-status': {
    component: () => import('@/domains/ledgermngt/pages/ExecutiveResponsibilityStatusPage'),
    title: '임원별 책무 현황',
    icon: 'analytics',
  },
  '/ledger/internal-control': {
    component: () => import('@/domains/ledgermngt/pages/HodICitemStatusPage'),
    title: '부서장 내부통제 항목 현황',
    icon: 'network_node',
  },
  '/ledger/structure-submission': {
    component: () => import('@/domains/ledgermngt/pages/StructureSubmissionStatusPage'),
    title: '책무구조도 제출',
    icon: 'upload',
  },
  '/ledger/responsibility-db-status': {
    component: () => import('@/domains/ledgermngt/pages/ResponsibilityDbStatusPage'),
    title: '책무 DB현황',
    icon: 'database',
  },

  // 조회
  '/inquiry/dept-status': {
    component: () => import('@/domains/inquiry/pages/DeptStatusPage'),
    title: '점검 현황(부서별)',
    icon: 'business',
  },
  '/inquiry/schedule': {
    component: () => import('@/domains/inquiry/pages/AuditProgMngtStatusPage'),
    title: '점검 계획',
    icon: 'calendar_alt',
  },
  '/inquiry/monthly-status': {
    component: () => import('@/domains/inquiry/pages/AuditItemStatusPage'),
    title: '점검 현황(항목별)',
    icon: 'calendar_month',
  },
  '/inquiry/non-employee': {
    component: () => import('@/domains/inquiry/pages/DeficiencyStatusPage'),
    title: '미흡상황 현황',
    icon: 'warning',
  },
  // 책무구조도 이력 점검
  '/history/dept-status': {
    component: () => import('@/domains/inquiry/pages/DeptStatusPage'),
    title: '부서별 현황',
    icon: 'business',
  },
 
};

/**
 * 페이지 컴포넌트 매퍼 클래스
 */
export class PageComponentMapper {
  /**
   * 경로에 해당하는 페이지 컴포넌트를 lazy load로 반환
   */
  static getComponent(path: string): React.ComponentType<any> {
    const mapping = PAGE_COMPONENT_MAPPING[path];

    if (!mapping) {
      console.error(
        `❌ [PageComponentMapper] 경로에 해당하는 컴포넌트를 찾을 수 없습니다: ${path}`
      );
      return ErrorPage;
    }

    try {
      // lazy 컴포넌트 생성
      return lazy(mapping.component);
    } catch (error) {
      console.error(`❌ [PageComponentMapper] 컴포넌트 로딩 중 오류 발생:`, error);
      return ErrorPage;
    }
  }

  /**
   * 경로에 해당하는 페이지 정보 반환
   */
  static getPageInfo(path: string): { title: string; icon?: string } | null {
    const mapping = PAGE_COMPONENT_MAPPING[path];

    if (!mapping) {
      return null;
    }

    return {
      title: mapping.title,
      icon: mapping.icon,
    };
  }

  /**
   * 모든 등록된 경로 목록 반환
   */
  static getAllPaths(): string[] {
    return Object.keys(PAGE_COMPONENT_MAPPING);
  }

  /**
   * 경로가 등록되어 있는지 확인
   */
  static hasPath(path: string): boolean {
    return path in PAGE_COMPONENT_MAPPING;
  }

  /**
   * 새로운 페이지 매핑 추가 (동적 등록)
   */
  static addMapping(
    path: string,
    mapping: {
      component: () => Promise<{ default: PageComponent }>;
      title: string;
      icon?: string;
    }
  ): void {
    PAGE_COMPONENT_MAPPING[path] = mapping;
  }
}

export default PageComponentMapper;
