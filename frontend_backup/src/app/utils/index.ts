import type { IUtils, IStringUtils } from '@/app/types/utils';
import ReactDOM from 'react-dom/client';

// 문자열 유틸리티 구현 클래스
class StringUtils implements IStringUtils {
	isEmpty(str: string | null | undefined): boolean {
		return !str || str.trim().length === 0;
	}
}

export class Utils implements IUtils {
	public string: IStringUtils = new StringUtils();
	
	private static instance: Utils;
	
	public static getInstance(): Utils {
		if(!this.instance) {
			this.instance = new Utils();
		}
		return this.instance;
	}
	
	public hashStringTo32BitInteger(str: string) {
		let hash = 0;
		
		for (let i=0; i < str.length; i++) {
			const charCode = str.charCodeAt(i);
			hash = (hash <<5) - hash + charCode;
			hash |= 0;
		}
		return hash;
	}
	
	public getFullUrl(relativeUrl : string ) {
		return new URL ( relativeUrl, import.meta.url).href;
	}
	
	public setCookie(key : string , value : string , expireTimes? : string) {
		let cookieText = encodeURIComponent(key) + '=' + encodeURIComponent(value);
		if (expireTimes) {
			const exdate = new Date();
			exdate.setDate(exdate.getDate() + Number(expireTimes));
			// 설정 일수만큼 현재시간에 만료값으로 지정
			cookieText += '; EXPIRES=' + exdate.toUTCString();
		}
		document.cookie = cookieText;
	}
	
	public removeCookie(keyName : string) : boolean {
		const temp = this.getCookie(keyName);
		if (temp) {
			this.setCookie(keyName, temp, '0');
			return true;
		} else {
			return false;
		}
	}
	
	public getCookie(key : string) : string {
		let cookieValue = '';
		if (document.cookie) {
			const array = document.cookie.split(encodeURIComponent(key) + '=');
			if (array.length >= 2) {
				const arraySub = array[1].split(';');
				cookieValue = decodeURIComponent(arraySub[0]);
			}
		} 
		return cookieValue;
	}
	
	// 로컬 스토리지에 데이터 저장
	public setLocalStorage(key : string, value : string) : void {
		localStorage.setItem(key, value);
	}
	
	// 로컬 스토리지에 저장된 값 호출
	public getLocalStorage(key : string) : string | null {
		return localStorage.getItem(key);
	}
	
	// 로컬 스토리지 특정 값 삭제
	public delItemLocalStorage(key : string) : void {
		localStorage.removeItem(key);
	}
	
	// 로컬 스토리지 전체 데이타 삭제
	public delAllLocalStorage() : void {
		localStorage.clear();
	}
	
	// 세션 스토리지에 데이터 저장
	public setSessionStorage(key : string, value: string) : void {
		sessionStorage.setItem(key, value);
	}
	
	// 세션 스토리지에 저장된 값 호출
	public getSessionStorage(key : string) : string | null {
		return sessionStorage.getItem(key);
	}
	
	// 세션 스토리지 특정 값 삭제
	public delItemSessionStorage(key : string) : void {
		sessionStorage.removeItem(key);
	}
	
	// 세션 스토리지 전체 데이타 삭제
	public delAllSessionStorage() : void {
		sessionStorage.clear();
	}
	
	// 특정 target tag에  JSX코드를 render 하는 공통 함수
	public renderReactDOM( target : Element | DocumentFragment, children : React.ReactNode): ReactDOM.Root {
		const root = ReactDOM.createRoot(target);
		root.render(children);
		return root;
	}
	
}



