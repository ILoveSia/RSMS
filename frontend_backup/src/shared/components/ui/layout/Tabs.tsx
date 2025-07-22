import {
  Badge,
  Box,
  Tabs as MuiTabs,
  Tab,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { forwardRef, useEffect, useState } from 'react';

// Tab 아이템 타입
export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

// Tabs 컴포넌트 타입
export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  orientation?: 'horizontal' | 'vertical';
  indicatorColor?: 'primary' | 'secondary';
  textColor?: 'primary' | 'secondary' | 'inherit';
  scrollButtons?: 'auto' | 'desktop' | 'on' | 'off';
  allowScrollButtonsMobile?: boolean;
  centered?: boolean;
  lazy?: boolean; // 탭 내용 지연 로딩
  keepMounted?: boolean; // 탭 내용 유지
  className?: string;
  sx?: any;
}

/**
 * Tabs 컴포넌트
 *
 * Material-UI Tabs를 기반으로 한 탭 컴포넌트
 * 다양한 variant, 배지, 지연 로딩 등을 제공
 *
 * @example
 * ```tsx
 * const tabItems = [
 *   { id: 'tab1', label: '탭 1', content: <div>내용 1</div> },
 *   { id: 'tab2', label: '탭 2', content: <div>내용 2</div>, badge: 5 },
 *   { id: 'tab3', label: '탭 3', content: <div>내용 3</div>, disabled: true }
 * ];
 *
 * <Tabs items={tabItems} defaultValue="tab1" />
 *
 * // 세로 방향 탭
 * <Tabs
 *   items={tabItems}
 *   orientation="vertical"
 *   variant="scrollable"
 * />
 * ```
 */
const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      defaultValue,
      value,
      onChange,
      variant = 'standard',
      orientation = 'horizontal',
      indicatorColor = 'primary',
      textColor = 'primary',
      scrollButtons = 'auto',
      allowScrollButtonsMobile = false,
      centered = false,
      lazy = false,
      keepMounted = false,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // 내부 상태 관리
    const [activeTab, setActiveTab] = useState<string>(() => {
      if (value) return value;
      if (defaultValue) return defaultValue;
      return items[0]?.id || '';
    });

    // 지연 로딩을 위한 로드된 탭 추적
    const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([activeTab]));

    // 외부 value 변경 시 동기화
    useEffect(() => {
      if (value && value !== activeTab) {
        setActiveTab(value);
        if (lazy) {
          setLoadedTabs(prev => new Set(prev).add(value));
        }
      }
    }, [value, activeTab, lazy]);

    // 탭 변경 처리
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
      setActiveTab(newValue);

      // 지연 로딩을 위해 새 탭을 로드된 목록에 추가
      if (lazy) {
        setLoadedTabs(prev => new Set(prev).add(newValue));
      }

      // 외부 onChange 호출
      if (onChange) {
        onChange(newValue);
      }
    };

    // 탭 레이블 렌더링
    const renderTabLabel = (item: TabItem) => {
      const labelContent = (
        <Box display='flex' alignItems='center' gap={1}>
          {item.icon}
          <Typography variant='inherit'>{item.label}</Typography>
        </Box>
      );

      if (item.badge) {
        return (
          <Badge
            badgeContent={item.badge}
            color='error'
            sx={{
              '& .MuiBadge-badge': {
                right: -6,
                top: 8,
              },
            }}
          >
            {labelContent}
          </Badge>
        );
      }

      return labelContent;
    };

    // 탭 컨텐츠 렌더링
    const renderTabContent = (item: TabItem) => {
      const isActive = activeTab === item.id;
      const shouldRender = keepMounted || isActive || (lazy && loadedTabs.has(item.id));

      if (!shouldRender) {
        return null;
      }

      return (
        <Box
          key={item.id}
          role='tabpanel'
          hidden={!isActive}
          id={`tabpanel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
          sx={{
            p: 3,
            display: isActive ? 'block' : 'none',
            ...(orientation === 'vertical' && {
              flexGrow: 1,
              maxWidth: 'calc(100% - 200px)', // 탭 너비 제외
            }),
          }}
        >
          {item.content}
        </Box>
      );
    };

    // 탭 컨테이너 스타일
    const getTabsContainerSx = () => {
      if (orientation === 'vertical') {
        return {
          display: 'flex',
          height: 'auto',
          minHeight: 400,
          ...sx,
        };
      }
      return sx;
    };

    // 탭 리스트 스타일
    const getTabsSx = () => {
      if (orientation === 'vertical') {
        return {
          borderRight: 1,
          borderColor: 'divider',
          minWidth: 200,
          '& .MuiTabs-indicator': {
            left: 0,
          },
        };
      }
      return {
        borderBottom: 1,
        borderColor: 'divider',
      };
    };

    return (
      <Box ref={ref} className={className} sx={getTabsContainerSx()} {...props}>
        <MuiTabs
          value={activeTab}
          onChange={handleTabChange}
          variant={variant}
          orientation={orientation}
          indicatorColor={indicatorColor}
          textColor={textColor}
          scrollButtons={scrollButtons}
          allowScrollButtonsMobile={allowScrollButtonsMobile}
          centered={centered && orientation === 'horizontal'}
          sx={getTabsSx()}
        >
          {items.map(item => (
            <Tab
              key={item.id}
              value={item.id}
              label={renderTabLabel(item)}
              disabled={item.disabled}
              id={`tab-${item.id}`}
              aria-controls={`tabpanel-${item.id}`}
              sx={{
                minWidth: 0,
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }}
            />
          ))}
        </MuiTabs>

        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>{items.map(renderTabContent)}</Box>
      </Box>
    );
  }
);

Tabs.displayName = 'Tabs';

export default Tabs;
