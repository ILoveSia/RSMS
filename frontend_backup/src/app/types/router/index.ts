import type { RouteObject } from "react-router-dom";

export type TItcenRoute = RouteObject & {
    name?: string;
    meta?: IRouteMeta;
  };
  
  export interface IRouteMeta {
    isSidebar?: boolean;
    isHeader?: boolean;
    isFooter?: boolean;
  }
  
  export interface IRouter {
    goBack(): void;
    push(path: string, options?: object): void;
    openExternal(url: string, options?: any): void;
    setNaviInstance(nav: any): void;
    setNavigationInstance(navigation: any): void;
    getNavigation(): any;
    setLocationInstance(location: any): void;
    getLocation(): any;
    registerAppRouter(allRouter: any): any;
    findRouteMeta(path: string): any;
    setPathMeta(path: string): any;
    setBasename(basename: string): any;
  }
  