import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Dashboard,
  Business,
  Person,
  Assignment,
  Science,
  Login,
  FiberManualRecord
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '@/shared/hooks/useNavigation';
import { useAuth } from '@/shared/context/AuthContext';

interface NavigationMenuProps {
  showHiddenRoutes?: boolean;
}

// 아이콘 매핑
const iconMap: Record<string, React.ComponentType> = {
  Dashboard,
  Business,
  Person,
  Assignment,
  Science,
  Login,
};

/**
 * 동적 네비게이션 메뉴 컴포넌트
 * RouteManager의 메타데이터를 기반으로 자동 생성
 */
const NavigationMenu: React.FC<NavigationMenuProps> = ({
  showHiddenRoutes = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigationMenu } = useNavigation();
  const { authState, hasAnyRole } = useAuth();

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // 토글 상태 관리
  const handleToggle = (path: string) => {
    setOpenItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // 메뉴 아이템 클릭 처리
  const handleItemClick = (path: string) => {
    navigate(path);
  };

  // 아이콘 렌더링
  const renderIcon = (iconName?: string, isChild = false) => {
    if (!iconName) {
      return isChild ? <FiberManualRecord sx={{ fontSize: 8 }} /> : null;
    }

    const IconComponent = iconMap[iconName];
    if (!IconComponent) {
      return isChild ? <FiberManualRecord sx={{ fontSize: 8 }} /> : null;
    }

    return <IconComponent />;
  };

  // 권한 확인
  const hasPermission = (item: any): boolean => {
    if (!item.meta?.requiresAuth) return true;
    if (!authState.isAuthenticated) return false;
    if (!item.meta?.roles || item.meta.roles.length === 0) return true;
    return hasAnyRole(item.meta.roles);
  };

  // 숨김 여부 확인
  const shouldShowItem = (item: any): boolean => {
    if (item.meta?.hidden && !showHiddenRoutes) return false;
    return hasPermission(item);
  };

  // 메뉴 아이템 렌더링
  const renderMenuItem = (item: any, depth = 0) => {
    if (!shouldShowItem(item)) return null;

    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems[item.path];

    return (
      <React.Fragment key={item.path}>
        <ListItem disablePadding sx={{ pl: depth * 2 }}>
          <ListItemButton
            selected={isActive}
            onClick={() => {
              if (hasChildren) {
                handleToggle(item.path);
              } else {
                handleItemClick(item.path);
              }
            }}
            sx={{
              minHeight: 48,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                }
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {renderIcon(item.icon, depth > 0)}
            </ListItemIcon>

            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.title}
                  {item.meta?.hidden && (
                    <Chip
                      label="개발"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ fontSize: '0.6rem', height: '16px' }}
                    />
                  )}
                </Box>
              }
              primaryTypographyProps={{
                variant: depth > 0 ? 'body2' : 'body1',
                fontWeight: isActive ? 'bold' : 'normal'
              }}
            />

            {hasChildren && (
              isOpen ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>

        {/* 하위 메뉴 */}
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children
                .filter(shouldShowItem)
                .map((child: any) => renderMenuItem(child, depth + 1))
              }
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 280 }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
        메뉴
      </Typography>
      <Divider />

      <List component="nav" sx={{ py: 1 }}>
        {navigationMenu
          .filter(shouldShowItem)
          .map((item) => renderMenuItem(item))
        }
      </List>

      {/* 개발자 모드 토글 */}
      {authState.user?.roles.includes('ADMIN') && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              관리자 모드
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default NavigationMenu;
