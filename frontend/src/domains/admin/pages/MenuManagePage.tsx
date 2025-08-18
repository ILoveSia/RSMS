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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { SearchButton, ExcelDownloadButton, RefreshButton } from '@/shared/components/ui/button';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
import { SearchBox } from '@/shared/components/ui/form';

interface Menu {
  id: number;
  menuCode: string;
  menuName: string;
  menuNameEn: string;
  parentId: number | null;
  menuLevel: number;
  sortOrder: number;
  menuUrl: string | null;
  iconClass: string | null;
  isActive: boolean;
  isVisible: boolean;
  description: string | null;
  children?: Menu[];
}

interface MenuFormData {
  menuCode: string;
  menuName: string;
  menuNameEn: string;
  parentId: number | null;
  menuLevel: number;
  sortOrder: number;
  menuUrl: string;
  iconClass: string;
  isActive: boolean;
  isVisible: boolean;
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
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    menuCode: '',
    menuName: '',
    menuNameEn: '',
    parentId: null,
    menuLevel: 1,
    sortOrder: 1,
    menuUrl: '',
    iconClass: '',
    isActive: true,
    isVisible: true,
    description: ''
  });

  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

  // 메뉴 데이터 로드 (임시 데이터)
  const loadMenus = useCallback(async () => {
    try {
      setLoading(true);
      // 임시 데이터 - 실제로는 API 호출
      const tempMenus: Menu[] = [
        {
          id: 1,
          menuCode: 'SYSTEM_MGMT',
          menuName: '시스템 관리',
          menuNameEn: 'System Management',
          parentId: null,
          menuLevel: 1,
          sortOrder: 7,
          menuUrl: null,
          iconClass: 'fas fa-cogs',
          isActive: true,
          isVisible: true,
          description: '시스템 관리 메뉴',
          children: [
            {
              id: 2,
              menuCode: 'SYSTEM_MENU_MGMT',
              menuName: '화면별 권한 관리',
              menuNameEn: 'Menu Permission Management',
              parentId: 1,
              menuLevel: 2,
              sortOrder: 1,
              menuUrl: '/system/menu-permission',
              iconClass: 'fas fa-shield-alt',
              isActive: true,
              isVisible: true,
              description: '화면별 권한 관리'
            },
            {
              id: 3,
              menuCode: 'SYSTEM_USER_MGMT',
              menuName: '사용자 권한 관리',
              menuNameEn: 'User Permission Management',
              parentId: 1,
              menuLevel: 2,
              sortOrder: 2,
              menuUrl: '/system/user-permission',
              iconClass: 'fas fa-users',
              isActive: true,
              isVisible: true,
              description: '사용자 권한 관리'
            }
          ]
        }
      ];
      
      setMenus(tempMenus);
    } catch (error) {
      showError('메뉴 정보를 불러오는데 실패했습니다.');
      console.error('메뉴 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  // 메뉴 추가/수정 다이얼로그 열기
  const handleOpenDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      setFormData({
        menuCode: menu.menuCode,
        menuName: menu.menuName,
        menuNameEn: menu.menuNameEn,
        parentId: menu.parentId,
        menuLevel: menu.menuLevel,
        sortOrder: menu.sortOrder,
        menuUrl: menu.menuUrl || '',
        iconClass: menu.iconClass || '',
        isActive: menu.isActive,
        isVisible: menu.isVisible,
        description: menu.description || ''
      });
    } else {
      setEditingMenu(null);
      setFormData({
        menuCode: '',
        menuName: '',
        menuNameEn: '',
        parentId: null,
        menuLevel: 1,
        sortOrder: 1,
        menuUrl: '',
        iconClass: '',
        isActive: true,
        isVisible: true,
        description: ''
      });
    }
    setDialogOpen(true);
  };

  // 메뉴 저장
  const handleSaveMenu = () => {
    try {
      if (editingMenu) {
        // 수정 로직
        showSuccess('메뉴가 수정되었습니다.');
      } else {
        // 추가 로직
        showSuccess('메뉴가 추가되었습니다.');
      }
      setDialogOpen(false);
      loadMenus(); // 목록 새로고침
    } catch (error) {
      showError('메뉴 저장에 실패했습니다.');
    }
  };

  // 메뉴 삭제
  const handleDeleteMenu = (menuId: number) => {
    if (window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
      try {
        // 삭제 로직
        showSuccess('메뉴가 삭제되었습니다.');
        loadMenus(); // 목록 새로고침
      } catch (error) {
        showError('메뉴 삭제에 실패했습니다.');
      }
    }
  };

  // 메뉴 렌더링 (계층 구조)
  const renderMenuRow = (menu: Menu, level: number = 0) => (
    <React.Fragment key={menu.id}>
      <TableRow>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: level * 2 }}>
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
        <TableCell>{menu.menuCode}</TableCell>
        <TableCell>{menu.menuLevel}</TableCell>
        <TableCell>{menu.sortOrder}</TableCell>
        <TableCell>{menu.menuUrl || '-'}</TableCell>
        <TableCell>
          <Chip
            label={menu.isActive ? '활성' : '비활성'}
            color={menu.isActive ? 'success' : 'default'}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Chip
            label={menu.isVisible ? '표시' : '숨김'}
            color={menu.isVisible ? 'primary' : 'default'}
            size="small"
          />
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
            <IconButton
              size="small"
              onClick={() => handleDeleteMenu(menu.id)}
              color="error"
            >
              <DeleteIcon />
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
              onClick={() => handleOpenDialog()}
            >
              메뉴 추가
            </Button>
            <RefreshButton onClick={loadMenus} />
          </Box>
        }
      />

      <PageContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          이 페이지는 임시 메뉴 관리 페이지입니다. 실제 기능 구현이 필요합니다.
        </Alert>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>메뉴명</TableCell>
                  <TableCell>메뉴 코드</TableCell>
                  <TableCell>레벨</TableCell>
                  <TableCell>정렬순서</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>활성화</TableCell>
                  <TableCell>표시</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menus.map(menu => renderMenuRow(menu))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </PageContent>

      {/* 메뉴 추가/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMenu ? '메뉴 수정' : '메뉴 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              label="메뉴 코드"
              value={formData.menuCode}
              onChange={(e) => setFormData({ ...formData, menuCode: e.target.value })}
              fullWidth
              required
            />
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
              label="메뉴 레벨"
              type="number"
              value={formData.menuLevel}
              onChange={(e) => setFormData({ ...formData, menuLevel: parseInt(e.target.value) })}
              fullWidth
            />
            <TextField
              label="정렬순서"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
              fullWidth
            />
            <TextField
              label="URL"
              value={formData.menuUrl}
              onChange={(e) => setFormData({ ...formData, menuUrl: e.target.value })}
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
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="활성화"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                />
              }
              label="표시"
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

      <Toast {...snackbar} onClose={hideSnackbar} />
    </PageContainer>
  );
};

export default MenuManagePage;
