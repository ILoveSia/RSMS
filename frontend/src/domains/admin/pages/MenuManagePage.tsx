import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Edit as EditIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';

import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { RefreshButton } from '@/shared/components/ui/button';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
import { menuApi } from '../api/menuApi';
import MenuPositionDialog from '../components/MenuPositionDialog';

interface Menu {
  id: number;
  menuName: string;
  menuNameEn: string;
  parentId: number | null;
  menuLevel: number;
  sortOrder: number;
  description: string | null;
  children?: Menu[];
  iconClass?: string | null;
}

interface MenuFormData {
  menuName: string;
  menuNameEn: string;
  iconClass: string;
  description: string;
}

/**
 * 메뉴 관리 페이지
 * 시스템의 모든 메뉴를 관리하는 임시 페이지입니다.
 */
const MenuManagePage: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    menuName: '',
    menuNameEn: '',
    iconClass: '',
    description: ''
  });

  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

  const loadMenus = useCallback(async () => {
    try {
      setLoading(true);
      const apiMenuData = await menuApi.getAllMenusWithParent();
      if (!apiMenuData || !Array.isArray(apiMenuData)) {
        showError('메뉴 데이터 형식이 올바르지 않습니다.');
        return;
      }

      const menuMap = new Map<number, Menu>();
      const rootMenus: Menu[] = [];

      apiMenuData.forEach(item => {
        const menu: Menu = {
          id: item.id,
          menuName: item.menuName,
          menuNameEn: item.menuNameEn,
          parentId: item.parentId,
          menuLevel: item.menuLevel,
          sortOrder: item.sortOrder,
          description: item.description,
          children: []
        };
        menuMap.set(item.id, menu);
      });

      apiMenuData.forEach(item => {
        const menu = menuMap.get(item.id)!;
        if (item.parentId === null || item.parentId === undefined || item.parentId === 0) {
          rootMenus.push(menu);
        } else {
          const parentMenu = menuMap.get(item.parentId);
          if (parentMenu) {
            parentMenu.children = parentMenu.children || [];
            parentMenu.children.push(menu);
          } else {
            rootMenus.push(menu);
          }
        }
      });

      const sortMenus = (menus: Menu[]) => {
        menus.sort((a, b) => a.sortOrder - b.sortOrder);
        menus.forEach(menu => {
          if (menu.children && menu.children.length > 0) {
            sortMenus(menu.children);
          }
        });
      };
      sortMenus(rootMenus);
      setMenus(rootMenus);
    } catch (error: any) {
      showError('메뉴 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  const handleOpenDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      setFormData({
        menuName: menu.menuName,
        menuNameEn: menu.menuNameEn,
        iconClass: menu.iconClass || '',
        description: menu.description || ''
      });
    } else {
      setEditingMenu(null);
      setFormData({
        menuName: '',
        menuNameEn: '',
        iconClass: '',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSaveMenu = () => {
    try {
      if (editingMenu) {
        showSuccess('메뉴가 수정되었습니다.');
      } else {
        showSuccess('메뉴가 추가되었습니다.');
      }
      setDialogOpen(false);
      loadMenus();
    } catch (error) {
      showError('메뉴 저장에 실패했습니다.');
    }
  };

  const handleSavePosition = (updatedMenus: Menu[]) => {
    try {
      // TODO: API 호출하여 서버에 변경사항 저장
      console.log('메뉴 위치 변경:', updatedMenus);
      setMenus(updatedMenus);
      showSuccess('메뉴 위치가 수정되었습니다.');
    } catch (error) {
      showError('메뉴 위치 수정에 실패했습니다.');
    }
  };

  const renderMenuRow = (menu: Menu, level: number = 0) => (
    <React.Fragment key={menu.id}>
      <TableRow>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: level * 4 }}>
            <Typography variant="body2">{menu.menuName}</Typography>
            {menu.children && menu.children.length > 0 && (
              <Chip
                label={`${menu.children.length}개 하위메뉴`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(menu)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
      {menu.children && menu.children.map(child => renderMenuRow(child, level + 1))}
    </React.Fragment>
  );

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="메뉴 관리"
        description="시스템의 모든 메뉴를 관리합니다."
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setPositionDialogOpen(true)}
            >
              메뉴 위치 수정
            </Button>
            <RefreshButton onClick={loadMenus} />
          </Box>
        }
      />

      <PageContent>
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>메뉴명</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menus.length > 0 ? (
                  menus.map(menu => renderMenuRow(menu))
                ) : (
                  <TableRow>
                    <TableCell colSpan={1} align="center">
                      <Typography variant="body2" color="text.secondary">
                        메뉴 데이터가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </PageContent>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMenu ? '메뉴 수정' : '메뉴 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              label="메뉴명"
              value={formData.menuName}
              onChange={(e) => setFormData({ ...formData, menuName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="영문 메뉴명"
              value={formData.menuNameEn}
              onChange={(e) => setFormData({ ...formData, menuNameEn: e.target.value })}
              fullWidth
            />
            <TextField
              label="아이콘 클래스"
              value={formData.iconClass}
              onChange={(e) => setFormData({ ...formData, iconClass: e.target.value })}
              fullWidth
            />
            <TextField
              label="설명"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button onClick={handleSaveMenu} variant="contained">
            {editingMenu ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

      <MenuPositionDialog
        open={positionDialogOpen}
        onClose={() => setPositionDialogOpen(false)}
        menus={menus}
        onSave={handleSavePosition}
      />

      <Toast {...snackbar} onClose={hideSnackbar} />
    </PageContainer>
  );
};

export default MenuManagePage;
