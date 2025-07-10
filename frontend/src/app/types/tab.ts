/**
 * 탭 시스템 관련 타입 정의
 */
import type { ComponentType, ReactNode } from 'react';

/**
 * 개별 탭 정보
 */
export interface Tab {
  id: string;
  title: string;
  path: string;
  component: ComponentType<any> | ReactNode; // 컴포넌트 함수 또는 JSX 요소 모두 지원
  closable?: boolean;
  icon?: string;
  params?: Record<string, unknown>;
  state?: Record<string, unknown>;
  isDirty?: boolean; // 수정된 내용이 있는지 여부
  createdAt: Date;
  lastActiveAt: Date;
}

/**
 * 탭 관리 상태
 */
export interface TabManagerState {
  tabs: Tab[];
  activeTabId: string | null;
  maxTabs: number;
  homeTabId: string;
}

/**
 * 탭 Context 타입
 */
export interface TabContextType {
  // 상태
  state: TabManagerState;
  tabs: Tab[]; // 직접 접근을 위한 tabs 배열 노출
  activeTabId: string | null; // 활성 탭 ID 직접 접근

  // 액션 메서드
  addTab: (tab: Omit<Tab, 'id' | 'createdAt' | 'lastActiveAt'>) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;

  // 헬퍼 메서드
  getActiveTab: () => Tab | null;
  getTabById: (tabId: string) => Tab | null;
  isTabActive: (tabId: string) => boolean;
  canCloseTab: (tabId: string) => boolean;
  hasUnsavedChanges: () => boolean;
}

/**
 * 탭 추가 옵션
 */
export interface AddTabOptions {
  title: string;
  path: string;
  component: ComponentType<any> | ReactNode; // 컴포넌트 함수 또는 JSX 요소 모두 지원
  closable?: boolean;
  icon?: string;
  params?: Record<string, unknown>;
  state?: Record<string, unknown>;
  activate?: boolean; // 추가 후 바로 활성화할지 여부
}

/**
 * 탭 컨테이너 Props
 */
export interface TabContainerProps {
  className?: string;
  showTabBar?: boolean;
  maxTabWidth?: number;
  allowReorder?: boolean;
}

/**
 * 탭 바 Props
 */
export interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabReorder?: (fromIndex: number, toIndex: number) => void;
  maxTabWidth?: number;
  className?: string;
}

/**
 * 탭 콘텐츠 Props
 */
export interface TabContentProps {
  activeTab: Tab | null;
  className?: string;
}

/**
 * 탭 아이템 Props
 */
export interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  maxWidth?: number;
  className?: string;
}

/**
 * 탭 메뉴 Props (우클릭 컨텍스트 메뉴)
 */
export interface TabMenuProps {
  tab: Tab;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onCloseTab: (tabId: string) => void;
  onCloseOtherTabs: (tabId: string) => void;
  onCloseAllTabs: () => void;
  onRefreshTab: (tabId: string) => void;
}

/**
 * 탭 드래그 앤 드롭 관련 타입
 */
export interface TabDragItem {
  id: string;
  index: number;
  type: 'tab';
}
