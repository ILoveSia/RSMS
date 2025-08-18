import { useAuth } from '@/shared/context/AuthContext';
import { useTabContext } from '@/shared/context/TabContext';
import { PageComponentMapper } from '@/shared/utils/pageComponentMapper';
import React, { useEffect, useState } from 'react';
import '../../../../assets/scss/style.css';

import { useReduxState } from '../../../store/use-store';

interface Menu {
  id: number;
  menuCode: string;
  menuName: string;
  menuNameEn?: string;
  parentId?: number;
  menuLevel: number;
  sortOrder: number;
  menuUrl?: string;
  iconClass?: string;
  isActive: boolean;
  isVisible: boolean;
  description?: string;
  children?: Menu[];
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
}

interface User {
  userid: string;
  username: string;
  email: string;
  role?: string;
  accessibleMenus?: Menu[];
}

interface MenuItemProps {
  title: string;
  children?: MenuItemProps[];
  isActive?: boolean;
  onClick?: () => void;
  menuUrl?: string;
}

interface LeftMenuProps {
  className?: string;
}

const LeftMenu: React.FC<LeftMenuProps> = ({ className = '' }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { addTab } = useTabContext();
  const { authState } = useAuth();

  // TabContext 디버깅

  // loginStore에서 사용자 데이터 가져오기
  const { data: _loginData } = useReduxState<User>('loginStore/login');
  // menuStore에서 메뉴 데이터 가져오기
  const { data: menuData } = useReduxState<Menu[]>('menuStore/accessibleMenus');
  const [menuItems, setMenuItems] = useState<MenuItemProps[]>([]);
  const [isMenuLoaded, setIsMenuLoaded] = useState<boolean>(false);

  // 컴포넌트 마운트 시 localStorage에서 메뉴 복원
  useEffect(() => {
    // AuthContext가 아직 로딩 중이면 메뉴 복원을 대기
    if (authState.loading) {
      return;
    }

    // 인증되지 않은 경우 메뉴 복원하지 않음
    if (!authState.isAuthenticated) {
      return;
    }

    // localStorage에서 메뉴 복원 시도
    const savedMenus = localStorage.getItem('accessibleMenus');

    if (savedMenus) {
      try {
        const parsedMenus = JSON.parse(savedMenus);

        if (Array.isArray(parsedMenus) && parsedMenus.length > 0) {
          const menuMap = new Map<number, Menu>();
          const rootMenus: Menu[] = [];

          // 1단계: 모든 메뉴를 Map에 저장
          parsedMenus.forEach((menu: Menu) => {
            menuMap.set(menu.id, { ...menu, children: [] });
          });

          // 2단계: 부모-자식 관계 설정
          parsedMenus.forEach((menu: Menu) => {
            const menuItem = menuMap.get(menu.id)!;

            if (menu.parentId && menuMap.has(menu.parentId)) {
              const parent = menuMap.get(menu.parentId)!;
              parent.children!.push(menuItem);
            } else {
              rootMenus.push(menuItem);
            }
          });

          // Menu 데이터를 MenuItemProps로 변환 (canRead=true인 메뉴만)
          const convertedMenus = rootMenus
            .filter(menu => menu.canRead === true) // 읽기 권한이 있는 메뉴만 표시
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(menu => {
              const converted = convertMenuToMenuItem(menu);
              return converted;
            });


          setMenuItems(convertedMenus);
          setIsMenuLoaded(true);

          if (convertedMenus.length > 0) {
            setExpandedItems([convertedMenus[0].title]);
          }
        } else {
          // localStorage에서 복원한 메뉴가 있다면 유지, 없다면 빈 배열로 설정
          // isMenuLoaded가 true라면 이미 localStorage 복원이 완료된 상태
          if (!isMenuLoaded) {
          } else if (menuItems.length === 0) {
            setMenuItems([]);
          } else {
          }
        }
      } catch (error) {
        localStorage.removeItem('accessibleMenus'); // 잘못된 데이터 제거
      }
    } else {
    }
  }, [authState.loading, authState.isAuthenticated]); // authState 의존성 추가

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(item => item !== title) : [...prev, title]
    );
  };

  // Menu 데이터를 MenuItemProps로 변환하는 함수
  const convertMenuToMenuItem = (menu: Menu): MenuItemProps => {
    const handleMenuClick = () => {
      if (!menu.menuUrl) {
        return;
      }

      // PageComponentMapper에서 컴포넌트 정보 가져오기
      const pageInfo = PageComponentMapper.getPageInfo(menu.menuUrl);
      const PageComponent = PageComponentMapper.getComponent(menu.menuUrl);

      if (!pageInfo || !PageComponent) {
        return;
      }

      try {
        // 탭 추가
        addTab({
          title: pageInfo.title,
          path: menu.menuUrl,
          component: PageComponent,
          closable: true,
          icon: pageInfo.icon,
        });

        // 이벤트 버블링 방지
        event?.stopPropagation();
      } catch (error) {
      }
    };

    return {
      title: menu.menuName,
      menuUrl: menu.menuUrl,
      onClick: menu.menuUrl ? handleMenuClick : undefined,
      children: menu.children
        ?.filter(child => child.canRead === true) // 하위 메뉴도 읽기 권한 필터링
        ?.sort((a, b) => a.sortOrder - b.sortOrder)
        .map(child => convertMenuToMenuItem(child)),
    };
  };

  // menuStore의 accessibleMenus 데이터를 메뉴 아이템으로 변환
  useEffect(() => {
    
    if (menuData && Array.isArray(menuData) && menuData.length > 0) {
      
      
      // 계층형 구조 구성: 부모-자식 관계 설정
      const menuMap = new Map<number, Menu>();
      const rootMenus: Menu[] = [];

      // 1단계: 모든 메뉴를 Map에 저장
      menuData.forEach((menu: Menu) => {
        menuMap.set(menu.id, { ...menu, children: [] });
      });

      // 2단계: 부모-자식 관계 설정
      menuData.forEach((menu: Menu) => {
        const menuItem = menuMap.get(menu.id)!;

        if (menu.parentId && menuMap.has(menu.parentId)) {
          // 부모가 있는 경우 부모의 children에 추가
          const parent = menuMap.get(menu.parentId)!;
          parent.children!.push(menuItem);
        } else {
          // 부모가 없는 경우 최상위 메뉴
          rootMenus.push(menuItem);
        }
      });

      // Menu 데이터를 MenuItemProps로 변환 (canRead=true인 메뉴만)
      const convertedMenus = rootMenus
        .filter(menu => menu.canRead === true) // 읽기 권한이 있는 메뉴만 표시
        .sort((a, b) => a.sortOrder - b.sortOrder) // 정렬 순서 적용
        .map(menu => convertMenuToMenuItem(menu));

      
      setMenuItems(convertedMenus);
      setIsMenuLoaded(true);

      // 첫 번째 메뉴를 기본으로 확장
      if (convertedMenus.length > 0) {
        setExpandedItems([convertedMenus[0].title]);
        
      }
    } else {
      
    }
  }, [menuData]);

  const renderMenuItem = (item: MenuItemProps, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);

    return (
      <div key={item.title}>
        <div
          className={`left-menu__item ${item.isActive ? 'left-menu__item--active' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.title);
            } else if (item.onClick) {
              // 하위 메뉴가 없고 onClick이 있는 경우 실행 (탭 추가)
              item.onClick();
            }
          }}
        >
          <div className='left-menu__item-icon'>
            <svg fill='currentColor' viewBox='0 0 24 24'>
              <path d='M8 5v14l11-7z' />
            </svg>
          </div>

          <span className='left-menu__item-text'>{item.title}</span>

          {hasChildren && (
            <div className='left-menu__item-expand'>
              {isExpanded ? (
                <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              ) : (
                <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              )}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className='left-menu__submenu'>
            {item.children?.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // 인증 상태 로딩 중
  if (authState.loading) {
    return (
      <div className={`left-menu ${className}`}>
        <div className='left-menu__empty'>
          <p>메뉴를 로드하는 중...</p>
        </div>
      </div>
    );
  }

  // 메뉴가 없을 때 표시할 내용
  if (!authState.isAuthenticated) {
    return (
      <div className={`left-menu ${className}`}>
        <div className='left-menu__empty'>
          <p>로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0 && isMenuLoaded) {
    return (
      <div className={`left-menu ${className}`}>
        <div className='left-menu__empty'>
          <p>접근 가능한 메뉴가 없습니다.</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`left-menu ${className}`}>
      <div>{menuItems.map(item => renderMenuItem(item))}</div>
    </div>
  );
};

export default LeftMenu;
