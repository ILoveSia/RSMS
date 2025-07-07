/**
 * 탭 상태 관리 Context
 *
 * 책임:
 * - 탭 상태 중앙 관리
 * - 탭 추가/삭제/활성화 기능 제공
 * - 탭 상태 LocalStorage 동기화
 * - 메모리 누수 방지
 */
import type { Tab, TabContextType, TabManagerState } from '@/app/types/tab';
import React, { ReactNode, createContext, useContext, useEffect, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';

// 초기 상태 정의
const initialState: TabManagerState = {
  tabs: [],
  activeTabId: null,
  maxTabs: 10,
  homeTabId: 'home',
};

// 액션 타입 정의
type TabAction =
  | {
      type: 'ADD_TAB';
      payload: Omit<Tab, 'id' | 'createdAt' | 'lastActiveAt'> & { activate?: boolean };
    }
  | { type: 'REMOVE_TAB'; payload: { tabId: string } }
  | { type: 'SET_ACTIVE_TAB'; payload: { tabId: string } }
  | { type: 'UPDATE_TAB'; payload: { tabId: string; updates: Partial<Tab> } }
  | { type: 'CLOSE_ALL_TABS' }
  | { type: 'CLOSE_OTHER_TABS'; payload: { tabId: string } }
  | { type: 'SET_TABS'; payload: { tabs: Tab[] } }
  | { type: 'UPDATE_LAST_ACTIVE'; payload: { tabId: string } };

// 탭 Reducer 함수
const tabReducer = (state: TabManagerState, action: TabAction): TabManagerState => {
  switch (action.type) {
    case 'ADD_TAB': {
      const { activate = true, ...tabData } = action.payload;

      // 동일한 path의 탭이 이미 존재하는지 확인
      const existingTab = state.tabs.find(tab => tab.path === tabData.path);
      if (existingTab) {
        // 기존 탭을 활성화하고 lastActiveAt 업데이트
        return {
          ...state,
          activeTabId: activate ? existingTab.id : state.activeTabId,
          tabs: state.tabs.map(tab =>
            tab.id === existingTab.id ? { ...tab, lastActiveAt: new Date() } : tab
          ),
        };
      }

      // 최대 탭 수 제한 확인
      if (state.tabs.length >= state.maxTabs) {
        // 가장 오래된 탭(홈탭 제외) 제거
        const removableTab = state.tabs
          .filter(tab => tab.id !== state.homeTabId && tab.closable !== false)
          .sort((a, b) => a.lastActiveAt.getTime() - b.lastActiveAt.getTime())[0];

        if (removableTab) {
          const filteredTabs = state.tabs.filter(tab => tab.id !== removableTab.id);
          const newTab: Tab = {
            ...tabData,
            id: tabData.path === '/main' ? 'home' : uuidv4(),
            createdAt: new Date(),
            lastActiveAt: new Date(),
          };

          return {
            ...state,
            tabs: [...filteredTabs, newTab],
            activeTabId: activate ? newTab.id : state.activeTabId,
          };
        }
      }

      // 새 탭 추가 (홈 탭의 경우 고정 ID 사용)
      const newTab: Tab = {
        ...tabData,
        id: tabData.path === '/main' ? 'home' : uuidv4(),
        createdAt: new Date(),
        lastActiveAt: new Date(),
      };

      const newState = {
        ...state,
        tabs: [...state.tabs, newTab],
        activeTabId: activate ? newTab.id : state.activeTabId,
      };

      return newState;
    }

    case 'REMOVE_TAB': {
      const { tabId } = action.payload;
      const newTabs = state.tabs.filter(tab => tab.id !== tabId);

      // 활성 탭이 제거되는 경우 다른 탭을 활성화
      let newActiveTabId = state.activeTabId;
      if (state.activeTabId === tabId) {
        if (newTabs.length > 0) {
          // 홈 탭이 있으면 홈 탭을, 없으면 첫 번째 탭을 활성화
          const homeTab = newTabs.find(tab => tab.id === state.homeTabId);
          newActiveTabId = homeTab ? homeTab.id : newTabs[0].id;
        } else {
          newActiveTabId = null;
        }
      }

      return {
        ...state,
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    }

    case 'SET_ACTIVE_TAB': {
      const { tabId } = action.payload;
      return {
        ...state,
        activeTabId: tabId,
        tabs: state.tabs.map(tab =>
          tab.id === tabId ? { ...tab, lastActiveAt: new Date() } : tab
        ),
      };
    }

    case 'UPDATE_TAB': {
      const { tabId, updates } = action.payload;
      return {
        ...state,
        tabs: state.tabs.map(tab => (tab.id === tabId ? { ...tab, ...updates } : tab)),
      };
    }

    case 'UPDATE_LAST_ACTIVE': {
      const { tabId } = action.payload;
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === tabId ? { ...tab, lastActiveAt: new Date() } : tab
        ),
      };
    }

    case 'CLOSE_ALL_TABS': {
      // 홈 탭만 남기고 모든 탭 제거
      const homeTab = state.tabs.find(tab => tab.id === state.homeTabId);
      return {
        ...state,
        tabs: homeTab ? [homeTab] : [],
        activeTabId: homeTab ? homeTab.id : null,
      };
    }

    case 'CLOSE_OTHER_TABS': {
      const { tabId } = action.payload;
      const keepTab = state.tabs.find(tab => tab.id === tabId);
      const homeTab = state.tabs.find(tab => tab.id === state.homeTabId);

      const tabsToKeep = [];
      if (homeTab && homeTab.id !== tabId) tabsToKeep.push(homeTab);
      if (keepTab) tabsToKeep.push(keepTab);

      return {
        ...state,
        tabs: tabsToKeep,
        activeTabId: tabId,
      };
    }

    case 'SET_TABS': {
      const { tabs } = action.payload;
      return {
        ...state,
        tabs,
      };
    }

    default:
      return state;
  }
};

// Context 생성
const TabContext = createContext<TabContextType | null>(null);

// Tab Provider 컴포넌트
interface TabProviderProps {
  children: ReactNode;
}

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(tabReducer, initialState);

  // localStorage에서 탭 상태 복원 (일시적으로 비활성화)
  useEffect(() => {
    // const storedTabs = localStorage.getItem('tabState');
    // if (storedTabs) {
    //   try {
    //     const parsedTabs = JSON.parse(storedTabs);
    //     if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
    //       console.log('[TabContext] localStorage에서 탭 상태 복원 중...', parsedTabs);
    //       // Date 객체 복원 및 컴포넌트 재생성
    //       const restoredTabs = parsedTabs.map(tab => {
    //         let component = null;
    //         // 홈 탭의 경우 컴포넌트를 다시 생성
    //         if (tab.path === '/main') {
    //           console.log('[TabContext] 홈 탭 컴포넌트 재생성 중...');
    //           // MainPage 동적 import
    //           const MainPage = React.lazy(() => import('@/domains/main/pages/MainPage'));
    //           component = <MainPage />;
    //         }
    //         return {
    //           ...tab,
    //           component,
    //           createdAt: new Date(tab.createdAt),
    //           lastActiveAt: new Date(tab.lastActiveAt),
    //         };
    //       });
    //       console.log('[TabContext] 복원된 탭들:', restoredTabs);
    //       dispatch({ type: 'SET_TABS', payload: { tabs: restoredTabs } });
    //     }
    //   } catch (error) {
    //     console.error('탭 상태 복원 실패:', error);
    //     localStorage.removeItem('tabState');
    //   }
    // }
  }, []);

  // 탭 상태 변경 시 localStorage에 저장
  useEffect(() => {
    if (state.tabs.length > 0) {
      // 컴포넌트는 저장하지 않고 나머지 정보만 저장
      const tabsToStore = state.tabs.map(({ component, ...rest }) => rest);
      localStorage.setItem('tabState', JSON.stringify(tabsToStore));
    } else {
      localStorage.removeItem('tabState');
    }
  }, [state.tabs]);

  // Context 값 생성
  const contextValue: TabContextType = {
    state,
    tabs: state.tabs, // 직접 접근을 위한 tabs 배열 노출
    activeTabId: state.activeTabId, // 활성 탭 ID 직접 접근

    // 액션 메서드
    addTab: tab => {
      dispatch({ type: 'ADD_TAB', payload: tab });
    },

    removeTab: tabId => {
      dispatch({ type: 'REMOVE_TAB', payload: { tabId } });
    },

    setActiveTab: tabId => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: { tabId } });
    },

    updateTab: (tabId, updates) => {
      dispatch({ type: 'UPDATE_TAB', payload: { tabId, updates } });
    },

    closeAllTabs: () => {
      dispatch({ type: 'CLOSE_ALL_TABS' });
    },

    closeOtherTabs: tabId => {
      dispatch({ type: 'CLOSE_OTHER_TABS', payload: { tabId } });
    },

    // 헬퍼 메서드
    getActiveTab: () => {
      return state.tabs.find(tab => tab.id === state.activeTabId) || null;
    },

    getTabById: tabId => {
      return state.tabs.find(tab => tab.id === tabId) || null;
    },

    isTabActive: tabId => {
      return state.activeTabId === tabId;
    },

    canCloseTab: tabId => {
      const tab = state.tabs.find(t => t.id === tabId);
      return tab ? tab.closable !== false && tab.id !== state.homeTabId : false;
    },

    hasUnsavedChanges: () => {
      return state.tabs.some(tab => tab.isDirty === true);
    },
  };

  return <TabContext.Provider value={contextValue}>{children}</TabContext.Provider>;
};

// Hook for using tab context
export const useTabContext = (): TabContextType => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabContext must be used within a TabProvider');
  }
  return context;
};

export default TabContext;
