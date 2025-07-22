/**
 * 탭 컨테이너 컴포넌트
 *
 * 책임:
 * - 탭 바와 탭 콘텐츠 영역 구성
 * - 탭 시스템 전체 레이아웃 관리
 * - 탭 Context와 연동
 */
import type { TabContainerProps } from '@/app/types/tab';
import { useTabContext } from '@/shared/context/TabContext';
import { Box } from '@mui/material';
import React from 'react';
import TabBar from './TabBar';
import TabContent from './TabContent';

const TabContainer: React.FC<TabContainerProps> = ({
  className = '',
  showTabBar = true,
  maxTabWidth = 200,
  allowReorder = true,
}) => {
  const { state, tabs = [], activeTabId, setActiveTab, removeTab } = useTabContext();

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleTabClose = (tabId: string) => {
    removeTab(tabId);
  };

  return (
    <Box
      className={`tab-container ${className}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* 탭 바 영역 */}
      {showTabBar && (
        <Box sx={{ flexShrink: 0 }}>
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
            maxTabWidth={maxTabWidth}
            className='tab-container__bar'
          />
        </Box>
      )}

      {/* 탭 콘텐츠 영역 */}
      <Box sx={{ flex: 1, overflow: 'hidden', height: '100%' }}>
        <TabContent
          activeTab={tabs.find(tab => tab.id === activeTabId) || null}
          className='tab-container__content'
        />
      </Box>
    </Box>
  );
};

export default TabContainer;
