export * from "./api";

export interface IUtils {
  hashStringTo32BitInteger(str: string): any;
  setCookie(key: string, value: string, expireTimes?: string): any;
  removeCookie(keyName: string): boolean;
  getCookie(key: string): string;
  setLocalStorage(key: string, value: string): void;
  getLocalStorage(key: string): string | null;
  delItemLocalStorage(key: string): void;
  delAllLocalStorage(): void;
  setSessionStorage(key: string, value: string): void;
  getSessionStorage(key: string): string | null;
  delItemSessionStorage(key: string): void;
  delAllSessionStorage(): void;
  renderReactDOM(
    target: Element | DocumentFragment,
    children: React.ReactNode
  ): any;
  string: IStringUtils;
}
export interface IStringUtils {
  isEmpty(str: string | null | undefined): boolean;
}

export interface IFormatters {
  formatCurrency(
    value: number | string | undefined | null,
    options?: {
      decimal?: number; // 소수점 자릿수
      prefix?: string; // 접두사
      suffix?: string; // 접미사e7
    }
  ): string;
  removeFormatCurrency(value: string): number;
  convertToKoreanWords(value: number | string | null | undefined): string;
}

// CommonService - CommonCode 서비스 관련 types -----------
export interface ICommonSevice {
  intializeCodes(): Promise<void>;
  getAllCodes(): Promise<TCommonCodeMap | null>;
  getCode(code: string): Promise<ICommonCode | null>;
}

export interface ICommonCode {
  code: string;
  codeName: string;
  workScCd: string;
  codes: ICommonCodes[];
}

export interface ICommonCodes {
  code: string;
  value: string;
  valueName: string;
}

// 코드 그룹 목록(제조합격체)을 위한 타입
export type TCommonCodeMap = Record<string, ICommonCode>;
