/**
 * 중앙 집중식 이미지 관리
 * 모든 이미지 파일들을 이 파일에서 import하고 export하여 관리합니다.
 * 
 * 사용법:
 * import { logoImage, iconUser } from '@/assets/images';
 */

// 로고 이미지들
// export { default as logoImage } from './logo.png';
// export { default as logoSmall } from './logo-small.png';

// 아이콘 이미지들
// export { default as iconUser } from './icons/user.svg';
// export { default as iconMenu } from './icons/menu.svg';
// export { default as iconSearch } from './icons/search.svg';
// export { default as iconPlay } from './icons/play.svg';

// 배경 이미지들
// export { default as backgroundMain } from './backgrounds/main-bg.jpg';

// 기타 이미지들
// export { default as placeholderImage } from './placeholder.png';

/**
 * 이미지 타입 정의
 */
export interface ImageAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

/**
 * 이미지 경로 헬퍼 함수
 */
export const getImagePath = (imageName: string): string => {
  return `/src/assets/images/${imageName}`;
};

/**
 * 이미지 프리로드 함수
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * 여러 이미지 프리로드 함수
 */
export const preloadImages = (sources: string[]): Promise<void[]> => {
  return Promise.all(sources.map(preloadImage));
};

// 현재는 이미지 파일이 없으므로 주석 처리
// 이미지 파일을 추가할 때 위의 주석을 해제하고 실제 파일 경로로 수정하세요. 