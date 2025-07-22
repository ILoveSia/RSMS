/**
 * 탭 바 컴포넌트
 *
 * 책임:
 * - 탭 목록 표시
 * - 탭 클릭 및 닫기 기능
 * - 탭 스크롤 관리
 */
import type { TabBarProps } from '@/app/types/tab';
import { useTabContext } from '@/shared/context/TabContext';
import { Close as CloseIcon, Home as HomeIcon, MoreHoriz as MoreIcon } from '@mui/icons-material';
import { Box, IconButton, Menu, MenuItem, Tab, Tabs, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  maxTabWidth = 200,
  className = '',
}) => {
  const theme = useTheme();
  const { canCloseTab, closeOtherTabs, closeAllTabs } = useTabContext();
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    tabId: string;
  } | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    onTabClick(newValue);
  };

  const handleTabRightClick = (event: React.MouseEvent, tabId: string) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            tabId,
          }
        : null
    );
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleCloseOtherTabs = () => {
    if (contextMenu) {
      closeOtherTabs(contextMenu.tabId);
    }
    handleContextMenuClose();
  };

  const handleCloseAllTabs = () => {
    closeAllTabs();
    handleContextMenuClose();
  };

  const renderTabIcon = (tab: (typeof tabs)[0]) => {
    if (tab.icon) {
      return (
        <Box component='span' sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
          {tab.id === 'home' ? <HomeIcon fontSize='small' /> : tab.icon}
        </Box>
      );
    }
    return null;
  };

  const renderTabCloseButton = (tab: (typeof tabs)[0]) => {
    if (!canCloseTab(tab.id)) {
      return null;
    }

    return (
      <Box
        component='span'
        onClick={event => {
          event.stopPropagation();
          onTabClose(tab.id);
        }}
        sx={{
          ml: 0.5,
          p: 0.25,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <CloseIcon fontSize='inherit' />
      </Box>
    );
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <Box
      className={`tab-bar ${className}`}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: theme.palette.background.paper,
        minHeight: 48,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Tabs
        value={activeTabId || false}
        onChange={handleTabChange}
        variant='scrollable'
        scrollButtons='auto'
        allowScrollButtonsMobile
        sx={{
          flexGrow: 1,
          '& .MuiTab-root': {
            maxWidth: maxTabWidth,
            minWidth: 120,
            textTransform: 'none',
            fontSize: '0.875rem',
            padding: '8px 12px',
          },
        }}
      >
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            value={tab.id}
            onContextMenu={event => handleTabRightClick(event, tab.id)}
            label={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              >
                {renderTabIcon(tab)}
                <Typography
                  variant='body2'
                  noWrap
                  sx={{
                    flex: 1,
                    textAlign: 'left',
                    fontSize: '0.875rem',
                  }}
                >
                  {tab.title}
                </Typography>
                {renderTabCloseButton(tab)}
              </Box>
            }
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          />
        ))}
      </Tabs>

      {/* 탭 옵션 메뉴 */}
      <Box sx={{ ml: 1, mr: 1 }}>
        <IconButton
          size='small'
          onClick={event => {
            setContextMenu({
              mouseX: event.currentTarget.getBoundingClientRect().left,
              mouseY: event.currentTarget.getBoundingClientRect().bottom,
              tabId: activeTabId || '',
            });
          }}
        >
          <MoreIcon />
        </IconButton>
      </Box>

      {/* 컨텍스트 메뉴 */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference='anchorPosition'
        anchorPosition={
          contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
        }
      >
        <MenuItem onClick={handleCloseOtherTabs}>다른 탭 닫기</MenuItem>
        <MenuItem onClick={handleCloseAllTabs}>모든 탭 닫기</MenuItem>
      </Menu>
    </Box>
  );
};

export default TabBar;
