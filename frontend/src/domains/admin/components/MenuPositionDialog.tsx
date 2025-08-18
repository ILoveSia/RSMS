import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface MenuPositionDialogProps {
  open: boolean;
  onClose: () => void;
  menus: Menu[];
  onSave: (updatedMenus: Menu[]) => void;
}

interface SortableMenuItemProps {
  menu: Menu;
  level: number;
  isExpanded: boolean;
  onToggleExpand: (menuId: number) => void;
  isDragging?: boolean;
  isOver?: boolean;
}

const SortableMenuItem: React.FC<SortableMenuItemProps> = ({
  menu,
  level,
  isExpanded,
  onToggleExpand,
  isDragging = false,
  isOver = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: itemIsDragging
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: itemIsDragging ? 0.5 : 1,
  };

  const hasChildren = menu.children && menu.children.length > 0;

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1,
        p: 2,
        pl: 2 + level * 3,
        border: '1px solid',
        borderColor: isOver ? 'primary.main' : 'divider',
        backgroundColor: isOver ? 'primary.light' : (isDragging ? 'action.hover' : 'background.paper'),
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        transition: 'all 0.2s ease'
      }}
      {...attributes}
      {...listeners}
    >
      <DragIcon color="action" sx={{ cursor: 'grab' }} />
      
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {menu.menuName}
        </Typography>
        {hasChildren && (
          <Chip
            label={`${menu.children!.length}개 하위메뉴`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {hasChildren && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(menu.id);
          }}
        >
          {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      )}
    </Paper>
  );
};

const MenuPositionDialog: React.FC<MenuPositionDialogProps> = ({
  open,
  onClose,
  menus,
  onSave
}) => {
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());
  const [flatMenuList, setFlatMenuList] = useState<Menu[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 메뉴를 평면화하여 드래그 앤 드롭에 사용
  const flattenMenus = (menuList: Menu[], level: number = 0): Menu[] => {
    const result: Menu[] = [];
    menuList.forEach(menu => {
      result.push({ ...menu, menuLevel: level });
      if (menu.children && menu.children.length > 0 && expandedMenus.has(menu.id)) {
        result.push(...flattenMenus(menu.children, level + 1));
      }
    });
    return result;
  };

  useEffect(() => {
    console.log('expandedMenus:', expandedMenus);
    console.log('menus:', menus);
    const flattened = flattenMenus(menus);
    console.log('flattened menus:', flattened);
    setFlatMenuList(flattened);
  }, [menus, expandedMenus]);

  const handleToggleExpand = (menuId: number) => {
    console.log('Toggle expand for menu ID:', menuId);
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
        console.log('Collapsing menu:', menuId);
      } else {
        newSet.add(menuId);
        console.log('Expanding menu:', menuId);
      }
      console.log('New expandedMenus:', newSet);
      return newSet;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as number || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (over && active.id !== over.id) {
      const activeMenu = flatMenuList.find(item => item.id === active.id);
      const overMenu = flatMenuList.find(item => item.id === over.id);
      
      if (activeMenu && overMenu) {
        // 같은 레벨에서의 순서 변경
        if (activeMenu.menuLevel === overMenu.menuLevel) {
          const oldIndex = flatMenuList.findIndex(item => item.id === active.id);
          const newIndex = flatMenuList.findIndex(item => item.id === over.id);
          const newFlatList = arrayMove(flatMenuList, oldIndex, newIndex);
          setFlatMenuList(newFlatList);
        } else {
          // 다른 레벨로 이동 (부모-자식 관계 변경)
          const newFlatList = flatMenuList.map(item => {
            if (item.id === active.id) {
              // 드롭된 메뉴의 레벨에 따라 parentId 설정
              if (overMenu.menuLevel === 0) {
                // 최상위 레벨로 이동
                return { ...item, parentId: null, menuLevel: 0 };
              } else {
                // 다른 메뉴의 하위로 이동
                return { ...item, parentId: overMenu.id, menuLevel: overMenu.menuLevel + 1 };
              }
            }
            return item;
          });
          setFlatMenuList(newFlatList);
        }
      }
    }
  };

  const handleSave = () => {
    // 평면화된 리스트를 다시 계층 구조로 변환
    const rebuildHierarchy = (menuList: Menu[]): Menu[] => {
      const menuMap = new Map<number, Menu>();
      const rootMenus: Menu[] = [];

      // 모든 메뉴를 Map에 추가
      menuList.forEach(menu => {
        menuMap.set(menu.id, { ...menu, children: [] });
      });

      // 계층 구조 구성
      menuList.forEach(menu => {
        const currentMenu = menuMap.get(menu.id)!;
        if (menu.parentId === null || menu.parentId === undefined || menu.parentId === 0) {
          rootMenus.push(currentMenu);
        } else {
          const parentMenu = menuMap.get(menu.parentId);
          if (parentMenu) {
            parentMenu.children = parentMenu.children || [];
            parentMenu.children.push(currentMenu);
          } else {
            rootMenus.push(currentMenu);
          }
        }
      });

      return rootMenus;
    };

    const updatedMenus = rebuildHierarchy(flatMenuList);
    onSave(updatedMenus);
    onClose();
  };

  const activeMenu = activeId ? flatMenuList.find(menu => menu.id === activeId) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        메뉴 위치 수정
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          메뉴를 드래그하여 순서를 변경하거나 다른 메뉴의 하위로 이동할 수 있습니다.
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ minHeight: 400, maxHeight: 600, overflow: 'auto' }}>
                      <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
            <SortableContext
              items={flatMenuList.map(menu => menu.id)}
              strategy={verticalListSortingStrategy}
            >
                             {flatMenuList.map((menu) => (
                 <SortableMenuItem
                   key={menu.id}
                   menu={menu}
                   level={menu.menuLevel}
                   isExpanded={expandedMenus.has(menu.id)}
                   onToggleExpand={handleToggleExpand}
                   isOver={overId === menu.id}
                 />
               ))}
            </SortableContext>

            <DragOverlay>
              {activeMenu ? (
                <Paper
                  sx={{
                    p: 2,
                    pl: 2 + activeMenu.menuLevel * 3,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    backgroundColor: 'background.paper',
                    boxShadow: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 200
                  }}
                >
                  <DragIcon color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {activeMenu.menuName}
                  </Typography>
                </Paper>
              ) : null}
            </DragOverlay>
          </DndContext>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuPositionDialog;
