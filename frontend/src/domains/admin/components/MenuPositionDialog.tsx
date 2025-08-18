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
  isDropTarget?: boolean;
  dropPosition?: 'before' | 'after' | 'inside';
}

const SortableMenuItem: React.FC<SortableMenuItemProps> = ({
  menu,
  level,
  isExpanded,
  onToggleExpand,
  isDragging = false,
  isOver = false,
  isDropTarget = false,
  dropPosition
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
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, position: 'relative' }}>
      {/* 드롭 인디케이터 - 위쪽 */}
      {isDropTarget && dropPosition === 'before' && (
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: 'primary.main',
            borderRadius: 1,
            zIndex: 10,
            boxShadow: 2
          }}
        />
      )}
      
      <Paper
        ref={setNodeRef}
        style={style}
        data-menu-id={menu.id}
        sx={{
          flexGrow: 1,
          p: 2,
          pl: 2 + level * 3,
          border: '2px solid',
          borderColor: isDropTarget && dropPosition === 'inside' 
            ? 'primary.main' 
            : isOver 
              ? 'primary.light' 
              : 'divider',
          backgroundColor: isDropTarget && dropPosition === 'inside'
            ? 'primary.light'
            : isOver 
              ? 'action.hover' 
              : (isDragging ? 'action.hover' : 'background.paper'),
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          transition: 'all 0.2s ease',
          boxShadow: isDropTarget ? 3 : 1
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
      </Paper>

      {hasChildren && (
        <IconButton
          size="small"
          sx={{ ml: 1 }}
          onClick={() => {
            console.log('IconButton clicked for menu:', menu.id);
            onToggleExpand(menu.id);
          }}
        >
          {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      )}
      
      {/* 드롭 인디케이터 - 아래쪽 */}
      {isDropTarget && dropPosition === 'after' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: 'primary.main',
            borderRadius: 1,
            zIndex: 10,
            boxShadow: 2
          }}
        />
      )}
    </Box>
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
  const [dropTarget, setDropTarget] = useState<{ id: number; position: 'before' | 'after' | 'inside' } | null>(null);
  const [currentMenus, setCurrentMenus] = useState<Menu[]>(menus);

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
    setCurrentMenus(menus);
  }, [menus]);

  useEffect(() => {
    console.log('expandedMenus:', expandedMenus);
    console.log('menus:', menus);
    const flattened = flattenMenus(currentMenus);
    console.log('flattened menus:', flattened);
    setFlatMenuList(flattened);
  }, [currentMenus, expandedMenus]);

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
    setDropTarget(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    setOverId(over?.id as number || null);
    
    if (over && active.id !== over.id) {
      const activeMenu = flatMenuList.find(item => item.id === active.id);
      const overMenu = flatMenuList.find(item => item.id === over.id);
      
      if (activeMenu && overMenu) {
        // 마우스 위치 기반으로 드롭 위치 결정
        const overElement = document.querySelector(`[data-menu-id="${overMenu.id}"]`) as HTMLElement;
        if (overElement && event.activatorEvent) {
          const rect = overElement.getBoundingClientRect();
          const mouseY = (event.activatorEvent as MouseEvent).clientY;
          const relativeY = mouseY - rect.top;
          const threshold = rect.height / 3; // 상단 1/3, 하단 1/3, 중간 1/3
          
          let position: 'before' | 'after' | 'inside';
          
          if (relativeY < threshold) {
            position = 'before';
          } else if (relativeY > rect.height - threshold) {
            position = 'after';
          } else {
            position = 'inside';
          }
          
          // 하위메뉴가 상위메뉴로 올라가는 것을 방지
          if (activeMenu.menuLevel > overMenu.menuLevel && position === 'before') {
            position = 'after'; // 같은 레벨로 유지
          }
          
          setDropTarget({ id: overMenu.id, position });
        }
      }
    } else {
      setDropTarget(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    setDropTarget(null);

    if (over && active.id !== over.id && dropTarget) {
      const activeMenu = flatMenuList.find(item => item.id === active.id);
      const overMenu = flatMenuList.find(item => item.id === over.id);
      
      if (activeMenu && overMenu) {
        // 평면화된 리스트를 업데이트
        let updatedFlatList = [...flatMenuList];
        
        if (dropTarget.position === 'inside') {
          // 다른 메뉴의 하위로 이동
          updatedFlatList = updatedFlatList.map(item => {
            if (item.id === active.id) {
              return { ...item, parentId: overMenu.id, menuLevel: overMenu.menuLevel + 1 };
            }
            return item;
          });
        } else {
          // 같은 레벨에서 순서 변경 (before/after)
          // overMenu의 parentId를 activeMenu의 parentId로 설정하여 같은 레벨 유지
          updatedFlatList = updatedFlatList.map(item => {
            if (item.id === active.id) {
              return { ...item, parentId: overMenu.parentId, menuLevel: overMenu.menuLevel };
            }
            return item;
          });
          
          // 순서 변경
          const oldIndex = updatedFlatList.findIndex(item => item.id === active.id);
          const newIndex = updatedFlatList.findIndex(item => item.id === over.id);
          
          let targetIndex = newIndex;
          if (dropTarget.position === 'before') {
            targetIndex = newIndex;
          } else if (dropTarget.position === 'after') {
            targetIndex = newIndex + 1;
          }
          
          updatedFlatList = arrayMove(updatedFlatList, oldIndex, targetIndex);
        }
        
        // 평면화된 리스트를 다시 계층 구조로 변환하여 currentMenus 업데이트
        const rebuildHierarchy = (menuList: Menu[]): Menu[] => {
          const menuMap = new Map<number, Menu>();
          const rootMenus: Menu[] = [];

          menuList.forEach(menu => {
            menuMap.set(menu.id, { ...menu, children: [] });
          });

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

        const updatedMenus = rebuildHierarchy(updatedFlatList);
        setCurrentMenus(updatedMenus);
      }
    }
  };

  const handleSave = () => {
    onSave(currentMenus);
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
                   isDropTarget={dropTarget?.id === menu.id}
                   dropPosition={dropTarget?.id === menu.id ? dropTarget.position : undefined}
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
