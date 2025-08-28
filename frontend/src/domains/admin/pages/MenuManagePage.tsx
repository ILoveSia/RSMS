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
  Alert,
  CircularProgress,
  Chip,
  Paper,
  IconButton
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Button } from '@/shared/components/ui/button'; // Corrected import

import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { useApiWithNotification } from '@/shared/hooks';
import { menuApi } from '../api/menuApi';
import MenuEditDialog from '../components/MenuEditDialog';

import type { MenuDto } from '../api/menuApi';

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
  const [menus, setMenus] = useState<MenuDto[]>([]);
  const [allMenus, setAllMenus] = useState<MenuDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuDto | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    menuName: '',
    menuNameEn: '',
    iconClass: '',
    description: ''
  });

  const { callApiWithNotification } = useApiWithNotification({
    showSuccessOnLoad: true,
    errorMessage: '메뉴 정보를 불러오는데 실패했습니다.'
  });

  const loadMenus = useCallback(async () => {
    setLoading(true);
    
    // getMenuHierarchy로 계층 구조 데이터 직접 가져오기
    const hierarchyData = await callApiWithNotification(() => menuApi.getMenuHierarchy());
    
    if (hierarchyData) {
      // 백엔드에서 이미 계층 구조로 제공하므로 변환 작업 불필요
      setMenus(hierarchyData);
      
      // flatMenus는 기존 로직 유지 (다이얼로그에서 사용)
      const flatMenus: MenuDto[] = [];
      const flattenMenus = (menus: MenuDto[]) => {
        menus.forEach(menu => {
          flatMenus.push({
            ...menu,
            children: []
          });
          if (menu.children && menu.children.length > 0) {
            flattenMenus(menu.children);
          }
        });
      };
      flattenMenus(hierarchyData);
      setAllMenus(flatMenus);
    }
    
    setLoading(false);
  }, [callApiWithNotification]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  const handleOpenDialog = (menu?: MenuDto) => {
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

  const handleSaveMenu = async () => {
    if (editingMenu) {
      // 메뉴 정보 업데이트를 위한 데이터 준비
      const updateData = {
        id: editingMenu.id,
        menuName: formData.menuName,
        menuNameEn: formData.menuNameEn,
        description: formData.description,
        parentId: editingMenu.parentId,
        sortOrder: editingMenu.sortOrder
      };
      
      const result = await callApiWithNotification(
        () => menuApi.updateMenu(updateData),
        'custom'
      );
      
      if (result) {
        setDialogOpen(false);
        loadMenus();
      }
    } else {
      // TODO: 메뉴 추가 API 구현 필요
    }
  };

  const handleOrderChange = (updatedMenus: MenuDto[]) => {
    // 메뉴 변경이 있었을 때만 메뉴 목록을 다시 로드 (메뉴 탭 새로고침)
    loadMenus();
  };

  const renderMenuRow = (menu: MenuDto, level: number = 0) => (
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
            <Button preset="refresh" onClick={loadMenus} /> {/* Modified */}
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
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menus.length > 0 ? (
                  menus.map(menu => renderMenuRow(menu))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
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

      <MenuEditDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editingMenu={editingMenu}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSaveMenu}
        allMenus={allMenus}
        onOrderChange={handleOrderChange}
      />


    </PageContainer>
  );
};

export default MenuManagePage;