/**
 * 탭 콘텐츠 컴포넌트
 *
 * 책임:
 * - 활성 탭의 콘텐츠 렌더링
 * - 탭 전환 시 애니메이션 효과
 * - 컴포넌트 메모리 관리
 */
import type { TabContentProps } from '@/app/types/tab';
import { Box, CircularProgress, Typography } from '@mui/material';
import React, { ComponentType, Suspense, isValidElement } from 'react';

const TabContent: React.FC<TabContentProps> = ({ activeTab, className = '' }) => {
  // 컴포넌트 렌더링 헬퍼 함수
  const renderTabComponent = (component: ComponentType<any> | React.ReactNode) => {
    console.log('🎨 [TabContent] 컴포넌트 렌더링:', component);
    console.log('🎨 [TabContent] 컴포넌트 타입:', typeof component);

    // 이미 렌더링된 React 요소인지 확인
    if (isValidElement(component)) {
      console.log('✅ [TabContent] React 요소로 렌더링');
      return component;
    }

    // lazy 컴포넌트인지 확인
    if (component && typeof component === 'object' && '$$typeof' in component) {
      console.log('✅ [TabContent] Lazy 컴포넌트로 렌더링');
      const LazyComponent = component as ComponentType<any>;
      return <LazyComponent />;
    }

    // 일반 함수 컴포넌트인지 확인
    if (typeof component === 'function') {
      console.log('✅ [TabContent] 함수 컴포넌트로 렌더링');
      const Component = component as ComponentType<any>;
      return <Component />;
    }

    // 그 외의 경우 (문자열, 숫자 등)
    console.log('⚠️ [TabContent] 기타 타입으로 렌더링:', component);
    return <Typography>{String(component)}</Typography>;
  };

  // 활성 탭이 없는 경우
  if (!activeTab) {
    console.log('❌ [TabContent] 활성 탭이 없음');
    return (
      <Box
        className={`tab-content ${className}`}
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: 'background.default',
        }}
      >
        <Typography variant='h6' color='text.secondary'>
          탭을 선택하세요
        </Typography>
      </Box>
    );
  }

  console.log('🎯 [TabContent] 활성 탭:', activeTab);

  return (
    <Box
      className={`tab-content ${className}`}
      sx={{
        flex: 1,
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'background.default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Suspense
        fallback={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography variant='body2' color='text.secondary'>
              페이지를 불러오는 중...
            </Typography>
          </Box>
        }
      >
        <Box
          key={activeTab.id}
          sx={{
            height: '100%',
            width: '100%',
            flex: 1,
            overflow: 'visible',
            position: 'relative',
            animation: 'fadeIn 0.2s ease-in-out',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {renderTabComponent(activeTab.component)}
        </Box>
      </Suspense>
    </Box>
  );
};

export default TabContent;
