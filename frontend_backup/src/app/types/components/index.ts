import type { ReactNode } from "react";

export interface IDialogStatus {
    component?: any;
    params?: any;
    key: number;
    list: any[];
    dialogContainerVm: any;
}

export interface IAlertOption {
    type?: "success" | "info" | "warning" | "error";
    close?: boolean;
    msg?: string;
    title?: string;
    autoDismiss?: number;
  }
  
  export interface IUiJS {
    dialogStatus: IDialogStatus;
    dialogComponentStatus: IDialogStatus;
    dialog: TDialog;
  }
  
  // UI - Dialog 컴포넌트 types --------------
export type TDialog = (
    message?: string | IDialogOption,
    option?: IDialogOption
  ) => Promise<any> & { innerClose: (reactNode: any) => void };
  
  export interface IDialogOption {
    type?: "success" | "info" | "warning" | "error";
    msg?: string;
    title?: string;
    confirmButton?: string;
    cancelButton?: string;
    close?: boolean | string;
    element?: ReactNode;
    dialogSize?: "xl" | "lg" | "sm" | "md";
  
    backdrop?: "static" | true | false;
    zIndex?: string;
    keyboard?: boolean;
  
    onHide?: (res: any) => void;
    width?: string;
    height?: string;
    isExternal?: boolean;
    url?: string;
  }
  
  export interface IDialogStatusList {
    component: ReactNode;
    componentInstance: null;
    key: string;
    params: IAlertOption;
    resolve: any;
  }
  