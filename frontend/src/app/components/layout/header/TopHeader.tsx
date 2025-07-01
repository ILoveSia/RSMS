import React from 'react';
import { useNavigate } from 'react-router-dom';
//import { useReduxState } from '../../../store/use-store';
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

interface TopHeaderProps {
  className?: string;
}

const TopHeader: React.FC<TopHeaderProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}')

  const handleTitleClick = () => {
    navigate('/main');
  };

  const handleLogout = () => {
    // localStorage에서 메뉴 데이터 삭제
    localStorage.removeItem('accessibleMenus');
    localStorage.removeItem('commonCodes');
    console.log('🔄 [TopHeader] 로그아웃 - localStorage 데이터 삭제 (메뉴, 공통코드)');
    
    // 로그인 페이지로 이동
    navigate('/login');
  };

  return (
    <div className={`top-header ${className}`}>
      {/* 좌측 - 시스템 제목 */}
      <div className="top-header__left">
        <h1 
          className="top-header__title" 
          onClick={handleTitleClick}
          style={{ cursor: 'pointer' }}
        >
          책무구조도 관리시스템
        </h1>
        
        {/* 검색창 */}
        <div className="top-header__search">
          <input
            type="text"
            placeholder="Search"
            className="top-header__search-input"
          />
          <button className="top-header__search-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 우측 - 사용자 정보 */}
      <div className="top-header__right">
        <div className="top-header__user-section">
          <div className="top-header__user-avatar">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="top-header__user-name">
            {user?.username || 'Guest'} ({user?.email || ''})
          </span>
          <button className="top-header__logout-button" title="로그아웃" onClick={handleLogout}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopHeader; 