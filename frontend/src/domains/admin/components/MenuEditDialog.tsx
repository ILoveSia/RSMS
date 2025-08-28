import { Box, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useReduxState } from '@/app/store/use-store';
import { Dialog } from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button'; // Modified import
import { Select } from '@/shared/components/ui/form';
import TextField from '@/shared/components/ui/data-display/TextField';
import type { SelectOption } from '@/shared/types/common';
import { menuApi, type MenuUpdateRequest, type MenuUpdateResponse } from '../api/menuApi';

interface Menu {
  id: number;
  menuName: string;
  menuNameEn: string;
  parentId: number | null;
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

interface MenuEditDialogProps {
  open: boolean;
  onClose: () => void;
  editingMenu: Menu | null;
  formData: MenuFormData;
  onFormDataChange: (formData: MenuFormData) => void;
  onSave: () => void;
  allMenus: Menu[];
  onOrderChange?: (updatedMenus: Menu[]) => void;
}

const MenuEditDialog: React.FC<MenuEditDialogProps> = ({
  open,
  onClose,
  editingMenu,
  formData,
  onFormDataChange,
  onSave,
  allMenus,
  onOrderChange
}) => {
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<number>(1);
  const [siblingMenus, setSiblingMenus] = useState<Menu[]>([]);

  // 리덕스 스토어에서 메뉴 데이터 가져오기
  const { setData: setMenuStoreData } = useReduxState<any[]>('menuStore/accessibleMenus');

  // 현재 메뉴가 루트 메뉴인지 확인
  const isRootMenu = editingMenu?.parentId === null || editingMenu?.parentId === undefined;

  // 초기값 설정
  useEffect(() => {
    if (editingMenu && open) {
      setSelectedParentId(editingMenu.parentId);
      setSelectedOrder(-1); // 기본값을 "변경 없음"으로 설정

      // 같은 부모 아래의 메뉴들 가져오기 (자기 자신 제외)
      if (editingMenu.parentId === null) {
        // 루트 메뉴인 경우
        const rootMenus = allMenus.filter(menu => menu.parentId === null && menu.id !== editingMenu.id);
        setSiblingMenus(rootMenus.sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        // 자식 메뉴인 경우
        const siblings = allMenus.filter(menu => menu.parentId === editingMenu.parentId && menu.id !== editingMenu.id);
        setSiblingMenus(siblings.sort((a, b) => a.sortOrder - b.sortOrder));
      }
    }
  }, [editingMenu, open, allMenus]);

  // 부모 변경 처리
  const handleParentChange = (newParentId: number | null) => {
    setSelectedParentId(newParentId);

    // 부모가 변경되면 해당 부모 아래의 메뉴들로 업데이트
    if (newParentId === null) {
      // 루트로 이동
      const rootMenus = allMenus.filter(menu => menu.parentId === null);
      setSiblingMenus(rootMenus.sort((a, b) => a.sortOrder - b.sortOrder));
    } else {
      // 다른 부모 아래로 이동
      const siblings = allMenus.filter(menu => menu.parentId === newParentId);
      setSiblingMenus(siblings.sort((a, b) => a.sortOrder - b.sortOrder));
    }

    // 순서는 맨 마지막으로 설정
    setSelectedOrder(siblingMenus.length + 1);
  };

  // 순서 변경 처리
  const handleOrderChange = (newOrder: number) => {
    setSelectedOrder(newOrder);
  };

  // 통합 저장 함수 (메뉴 정보 + 순서 변경)
  const handleSave = async () => {
    if (editingMenu) {
      try {
        // 순서 변경이 없는 경우 (selectedOrder === -1) 메뉴 정보만 업데이트
        if (selectedOrder === -1) {
          const updateData: MenuUpdateRequest = {
            id: editingMenu.id,
            menuName: formData.menuName,
            menuNameEn: formData.menuNameEn,
            description: formData.description,
            parentId: editingMenu.parentId, // 기존 부모 유지
            sortOrder: editingMenu.sortOrder // 기존 순서 유지
          };

          const response: MenuUpdateResponse = await menuApi.updateMenu(updateData);

          // 변경 사항이 있었는지 확인
          if (response.success) {
            if (response.orderChanged || response.infoChanged) {
              // 변경 사항이 있었으면 부모 컴포넌트에 알림
              if (onOrderChange) {
                onOrderChange([]);
              }

              // 리덕스 스토어 업데이트를 위해 메뉴 데이터 새로고침
              try {
                // 사용자 권한에 따른 접근 가능한 메뉴를 다시 가져와서 리덕스 스토어 업데이트
                const menuResponse = await fetch('/api/menus/accessible?role=ADMIN');
                const updatedMenus = await menuResponse.json();
                setMenuStoreData(updatedMenus);
                console.log('리덕스 스토어 메뉴 데이터 업데이트 완료');
              } catch (error) {
                console.error('리덕스 스토어 메뉴 데이터 업데이트 실패:', error);
              }
            }
          } else {
            console.error('메뉴 수정 실패:', response.errorMessage);
            // TODO: 에러 처리 (토스트 메시지 등)
            return;
          }
        } else {
          // 순서 변경이 있는 경우
          let targetSortOrder: number;

          if (selectedOrder === 0) {
            // 최상단에 배치
            targetSortOrder = 0;
          } else {
            // 선택된 메뉴의 sortOrder를 그대로 사용
            const selectedMenu = siblingMenus[selectedOrder - 1];
            targetSortOrder = selectedMenu ? selectedMenu.sortOrder : 1;
          }

          // API 호출을 위한 데이터 준비
          const updateData: MenuUpdateRequest = {
            id: editingMenu.id,
            menuName: formData.menuName,
            menuNameEn: formData.menuNameEn,
            description: formData.description,
            parentId: selectedParentId,
            sortOrder: targetSortOrder
          };

          const response: MenuUpdateResponse = await menuApi.updateMenu(updateData);

          // 변경 사항이 있었는지 확인
          if (response.success) {
            if (response.orderChanged || response.infoChanged) {
              // 변경 사항이 있었으면 부모 컴포넌트에 알림
              if (onOrderChange) {
                onOrderChange([]);
              }

              // 리덕스 스토어 업데이트를 위해 메뉴 데이터 새로고침
              try {
                // 사용자 권한에 따른 접근 가능한 메뉴를 다시 가져와서 리덕스 스토어 업데이트
                const menuResponse = await fetch('/api/menus/accessible?role=ADMIN');
                const updatedMenus = await menuResponse.json();
                setMenuStoreData(updatedMenus);
                console.log('리덕스 스토어 메뉴 데이터 업데이트 완료');
              } catch (error) {
                console.error('리덕스 스토어 메뉴 데이터 업데이트 실패:', error);
              }
            }
          } else {
            console.error('메뉴 수정 실패:', response.errorMessage);
            // TODO: 에러 처리 (토스트 메시지 등)
            return;
          }
        }

        // 다이얼로그 닫기
        onClose();
      } catch (error) {
        console.error('메뉴 수정 실패:', error);
        // TODO: 에러 처리 (토스트 메시지 등)
      }
    } else {
      // 새 메뉴 추가인 경우 기존 onSave 호출
      onSave();
    }
  };

  // 루트 메뉴 목록 (부모 선택용)
  const rootMenus = allMenus.filter(menu => menu.parentId === null || menu.parentId === undefined);

  // 부모 선택 옵션 생성 (자식 메뉴는 루트로 이동할 수 없음)
  const parentOptions: SelectOption[] = rootMenus.map(menu => ({
    value: menu.id.toString(),
    label: menu.menuName
  }));

  const handleParentSelectChange = (value: string | number | string[] | number[]) => {
    const parentId = Array.isArray(value) ? null : Number(value);
    handleParentChange(parentId);
  };

  // 다이얼로그 닫을 때 처리
  const handleClose = () => {
    // 초기값으로 복원
    if (editingMenu) {
      setSelectedParentId(editingMenu.parentId);
      setSelectedOrder(editingMenu.sortOrder);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      title={editingMenu ? '메뉴 수정' : '메뉴 추가'}
             actions={
         <Box sx={{ display: 'flex', gap: 1 }}>
           <Button preset="cancel" onClick={handleClose} /> {/* Modified */}
           <Button preset="save" onClick={handleSave} />
         </Box>
       }
    >
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* 왼쪽: 편집 폼 */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            메뉴 정보
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="메뉴명"
              value={formData.menuName || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormDataChange({ ...formData, menuName: e.target.value })}
              fullWidth
              required
              mode="editable"
            />
            <TextField
              label="영문 메뉴명"
              value={formData.menuNameEn || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormDataChange({ ...formData, menuNameEn: e.target.value })}
              fullWidth
              mode="editable"
            />
            <TextField
              label="설명"
              value={formData.description || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormDataChange({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              mode="editable"
            />
          </Box>
        </Box>

                 {/* 오른쪽: 순서 변경 (편집 중인 메뉴가 있을 때만 표시) */}
         {editingMenu && onOrderChange && (
           <Box sx={{ flex: 1 }}>
             <Typography variant="h6" sx={{ mb: 2 }}>
               메뉴 순서 관리
             </Typography>

             {!isRootMenu && (
               <Box sx={{ mb: 2 }}>
                 <Select
                   label="부모 메뉴"
                   value={selectedParentId?.toString() || ''}
                   options={parentOptions}
                   onChange={(value) => handleParentSelectChange(value as string | number | string[] | number[])}
                   placeholder="부모 메뉴를 선택하세요"
                 />
               </Box>
             )}

                           <Box sx={{ mb: 2 }}>
                                 <Select
                   label="메뉴 순서"
                   value={selectedOrder.toString()}
                   options={[
                     { value: '-1', label: '변경 없음' },
                     { value: '0', label: '최상단에 배치합니다' },
                     ...siblingMenus.map((menu, idx) => ({
                       value: (idx + 1).toString(),
                       label: `${menu.menuName} 아래에 배치합니다`
                     }))
                   ]}
                   onChange={(value) => handleOrderChange(Array.isArray(value) ? -1 : Number(value))}
                   placeholder="순서를 선택하세요"
                 />
              </Box>
           </Box>
         )}
      </Box>
    </Dialog>
  );
};

export default MenuEditDialog;