import { useTabContext } from '@/shared/context/TabContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../../assets/scss/style.css';
import { useReduxState } from '../../../store/use-store';

interface TopHeaderProps {
  className?: string;
  style?: React.CSSProperties;
}

// Redux 저장용 사용자 정보 인터페이스
interface LoginUser {
  userid: string;
  username: string;
  email: string;
  role?: string;
  accessibleMenus?: unknown[];
}

const TopHeader: React.FC<TopHeaderProps> = ({ className = '', style }) => {

  const navigate = useNavigate();
  const { setActiveTab, addTab } = useTabContext();

  // Redux Store에서 사용자 정보 가져오기
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');

  const handleTitleClick = () => {
    // 홈 탭으로 이동
    addTab({
      id: 'home',
      title: '메인화면',
      content: 'main',
      closeable: false
    });
    setActiveTab('home');
  };

  const handleLogout = () => {
    // localStorage에서 메뉴 데이터 삭제
    localStorage.removeItem('accessibleMenus');
    localStorage.removeItem('commonCodes');

    // sessionStorage에서 사용자 정보 삭제
    sessionStorage.removeItem('user');


    // 로그인 페이지로 이동
    navigate('/login');
  };

  return (
    <div className={`top-header ${className}`} style={style}>
      {/* 좌측 - 시스템 제목 */}
      <div className='top-header__left'>
        <h1 className='top-header__title' onClick={handleTitleClick} style={{ cursor: 'pointer' }}>
          책무구조도 관리시스템
        </h1>

        {/* 검색창 */}
        <div className='top-header__search'>
          <input type='text' placeholder='Search' className='top-header__search-input' />
          <button className='top-header__search-button'>
            <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 우측 - 사용자 정보 */}
      <div className='top-header__right'>
        <div className='top-header__user-section'>
          <div className='top-header__user-avatar'>
            <svg fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <span className='top-header__user-name'>
            {loginData?.username || 'Guest'} ({loginData?.email || ''})
          </span>
          <button className='top-header__logout-button' title='로그아웃' onClick={handleLogout}>
            <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
