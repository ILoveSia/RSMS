// Layout 카테고리 컴포넌트 exports
export { default as Card, type CardProps } from './Card';
export { default as Drawer, type DrawerProps } from './Drawer';
export { default as Tabs, type TabItem, type TabsProps } from './Tabs';
export { PageContainer, default as PageContainerDefault } from './PageContainer';
export { PageHeader, default as PageHeaderDefault } from './PageHeader';
export { PageContent, default as PageContentDefault } from './PageContent';

// 기본 컴포넌트 Props 인터페이스
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
  sx?: any;
}
