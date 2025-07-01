import React, { useState, useEffect } from 'react';
import { useRouter } from '../../../router';
import { useReduxState } from '../../../store/use-store';
import '../../../../assets/scss/style.css';

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
  const router = useRouter();
  
  // loginStore에서 사용자 데이터 가져오기
  const { data: loginData } = useReduxState<User>('loginStore/login');
  // menuStore에서 메뉴 데이터 가져오기
  const { data: menuData } = useReduxState<{data: Menu[]}>('menuStore/accessibleMenus');
  const [menuItems, setMenuItems] = useState<MenuItemProps[]>([]);
  const [isMenuLoaded, setIsMenuLoaded] = useState<boolean>(false);

  // 컴포넌트 마운트 시 localStorage에서 메뉴 복원
  useEffect(() => {
    // console.log('🔄 [LeftMenu] 컴포넌트 마운트');
    // console.log('🔄 [LeftMenu] loginData:', loginData);
    // console.log('🔄 [LeftMenu] menuData:', menuData);
    
    // localStorage에서 메뉴 복원 시도
    const savedMenus = localStorage.getItem('accessibleMenus');
    // console.log('🔍 [LeftMenu] localStorage 확인:', savedMenus ? ' 데이터 있음' : '데이터 없음');
    
    if (savedMenus) {
      try {
        const parsedMenus = JSON.parse(savedMenus);
        // console.log('🔄 [LeftMenu] localStorage에서 메뉴 복원 시도:', parsedMenus.length, '개');
        // console.log('🔍 [LeftMenu] 파싱된 메뉴 원본 데이터:', parsedMenus);
        
        if (Array.isArray(parsedMenus) && parsedMenus.length > 0) {
          const menuMap = new Map<number, Menu>();
          const rootMenus: Menu[] = [];
          
          // 1단계: 모든 메뉴를 Map에 저장
          parsedMenus.forEach((menu: Menu) => {
            menuMap.set(menu.id, { ...menu, children: [] });
          });
          // console.log('🔍 [LeftMenu] menuMap 크기:', menuMap.size);
          
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
          // console.log('🔍 [LeftMenu] rootMenus 개수:', rootMenus.length);
          // console.log('🔍 [LeftMenu] rootMenus 데이터:', rootMenus);
          
          // Menu 데이터를 MenuItemProps로 변환
          const convertedMenus = rootMenus
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(menu => {
              const converted = convertMenuToMenuItem(menu);
              // console.log('🔍 [LeftMenu] 변환:', menu.menuName, '->', converted);
              return converted;
            });
          
          // console.log('🔍 [LeftMenu] 최종 변환된 메뉴들:', convertedMenus);
          // console.log('🔍 [LeftMenu] setMenuItems 호출 전 - 현재 menuItems 길이:', menuItems.length);
          
          setMenuItems(convertedMenus);
          setIsMenuLoaded(true);
          
          // 상태 업데이트 확인을 위한 타이머
          setTimeout(() => {
            console.log('🔍 [LeftMenu] setMenuItems 호출 후 100ms - 상태 확인 필요');
          }, 100);
          
          if (convertedMenus.length > 0) {
            setExpandedItems([convertedMenus[0].title]);
          }
          
          // console.log('✅ [LeftMenu] localStorage에서 메뉴 복원 완료:', convertedMenus.length, '개 메뉴');
        } else {
          // console.log('⚠️ [LeftMenu] localStorage 메뉴 데이터가 비어있음');
        }
      } catch (error) {
        console.error('❌ [LeftMenu] localStorage 메뉴 복원 실패:', error);
        localStorage.removeItem('accessibleMenus'); // 잘못된 데이터 제거
      }
    } else {
      console.log('⚠️ [LeftMenu] localStorage에 메뉴 데이터 없음');
    }
  }, []);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  // Menu 데이터를 MenuItemProps로 변환하는 함수
  const convertMenuToMenuItem = (menu: Menu): MenuItemProps => {
    return {
      title: menu.menuName,
      menuUrl: menu.menuUrl,
      onClick: menu.menuUrl ? () => router.push(menu.menuUrl!) : undefined,
      children: menu.children
        ?.sort((a, b) => a.sortOrder - b.sortOrder) // 하위 메뉴도 정렬
        .map(child => convertMenuToMenuItem(child))
    };
  };

  // menuStore의 accessibleMenus 데이터를 메뉴 아이템으로 변환
  useEffect(() => {
    // console.log('🔄 [LeftMenu] useEffect 실행');
    // console.log('🔄 [LeftMenu] menuData 값:', menuData);
    // console.log('🔄 [LeftMenu] menuData.data 값:', menuData?.data);
    // console.log('🔄 [LeftMenu] menuData.data 타입:', typeof menuData?.data);
    // console.log('🔄 [LeftMenu] menuData.data 배열 여부:', Array.isArray(menuData?.data));
    // console.log('🔄 [LeftMenu] menuData.data 길이:', menuData?.data?.length);
    
    if (menuData?.data && menuData.data.length > 0) {
      
      // 계층형 구조 구성: 부모-자식 관계 설정
      const menuMap = new Map<number, Menu>();
      const rootMenus: Menu[] = [];
      
      // 1단계: 모든 메뉴를 Map에 저장
      menuData.data.forEach((menu: Menu) => {
        menuMap.set(menu.id, { ...menu, children: [] });
      });
      
      // 2단계: 부모-자식 관계 설정
      menuData.data.forEach((menu: Menu) => {
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
      
      // console.log('🔍 [LeftMenu] 최상위 메뉴 개수:', rootMenus.length);
      // console.log('🔍 [LeftMenu] 계층형 구조:', rootMenus);
      
      // Menu 데이터를 MenuItemProps로 변환
      const convertedMenus = rootMenus
        .sort((a, b) => a.sortOrder - b.sortOrder) // 정렬 순서 적용
        .map(menu => convertMenuToMenuItem(menu));
      
      setMenuItems(convertedMenus);
      setIsMenuLoaded(true);
      
      // 첫 번째 메뉴를 기본으로 확장
      if (convertedMenus.length > 0) {
        setExpandedItems([convertedMenus[0].title]);
      }
      
      // console.log('✅ [LeftMenu] 메뉴 아이템 변환 완료:', convertedMenus);
    } else {
      console.log('⚠️ [LeftMenu] menuStore에 메뉴 데이터가 없습니다.');
      console.log('🔍 [LeftMenu] menuData 상태:', {
        hasMenuData: !!menuData,
        hasMenuDataData: !!menuData?.data,
        menuCount: menuData?.data?.length || 0
      });
      // localStorage에서 복원한 메뉴가 있다면 유지, 없다면 빈 배열로 설정
      // isMenuLoaded가 true라면 이미 localStorage 복원이 완료된 상태
      if (!isMenuLoaded) {
        console.log('🔍 [LeftMenu] 메뉴 로딩 전이므로 빈 배열로 설정하지 않음');
      } else if (menuItems.length === 0) {
        console.log('🔍 [LeftMenu] localStorage 메뉴도 없으므로 빈 배열로 설정');
      setMenuItems([]);
      } else {
        console.log('🔍 [LeftMenu] localStorage에서 복원한 메뉴 유지:', menuItems.length, '개');
      }
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
            } else if (item.menuUrl) {
              // 하위 메뉴가 없고 URL이 있는 경우 페이지 이동
              router.push(item.menuUrl);
            }
            item.onClick?.();
          }}
        >
          <div className="left-menu__item-icon">
            <svg 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          
          <span className="left-menu__item-text">{item.title}</span>
          
          {hasChildren && (
            <div className="left-menu__item-expand">
              {isExpanded ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="left-menu__submenu">
            {item.children?.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // 메뉴가 없을 때 표시할 내용
  console.log('🔍 [LeftMenu] 렌더링 조건 확인:', {
    hasLoginData: !!loginData,
    menuItemsLength: menuItems.length,
    isMenuLoaded: isMenuLoaded,
    menuItems: menuItems
  });
  console.log('🔍 [LeftMenu] menuItems 상세:', menuItems.map(item => ({ title: item.title, menuUrl: item.menuUrl })));

  if (!loginData) {
    console.log('⚠️ [LeftMenu] 로그인 데이터 없음 - 로그인 필요 메시지 표시');
    return (
      <div className={`left-menu ${className}`}>
        <div className="left-menu__empty">
          <p>로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0 && isMenuLoaded) {
    console.log('⚠️ [LeftMenu] 메뉴 아이템 없음 - 접근 가능한 메뉴 없음 메시지 표시');
    return (
      <div className={`left-menu ${className}`}>
        <div className="left-menu__empty">
          <p>접근 가능한 메뉴가 없습니다.</p>
        </div>
      </div>
    );
  }

  if (!isMenuLoaded) {
    console.log('⚠️ [LeftMenu] 메뉴 로딩 중...');
    return (
      <div className={`left-menu ${className}`}>
        <div className="left-menu__empty">
          <p>메뉴를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  console.log('✅ [LeftMenu] 메뉴 렌더링:', menuItems.length, '개 메뉴');

  return (
    <div className={`left-menu ${className}`}>
      <div>
        {menuItems.map(item => renderMenuItem(item))}
      </div>
    </div>
  );
};

export default LeftMenu; 