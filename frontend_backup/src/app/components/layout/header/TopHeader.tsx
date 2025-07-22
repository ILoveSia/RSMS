import { useAuth } from '@/shared/context/AuthContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TopHeaderProps {
  style?: React.CSSProperties;
}

const TopHeader: React.FC<TopHeaderProps> = ({ style }) => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();

  const handleLogout = () => {
    try {
      console.log('🚪 [TopHeader] 로그아웃 시작');

      // AuthContext의 logout 함수 호출 (모든 데이터 정리 포함)
      logout();

      // 로그인 페이지로 리다이렉트
      navigate('/login');

      console.log('✅ [TopHeader] 로그아웃 완료 - 로그인 페이지로 이동');
    } catch (error) {
      console.error('❌ [TopHeader] 로그아웃 처리 실패:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        height: '100%',
        ...style,
      }}
    >
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>ITCEN Solution</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {authState.isAuthenticated && authState.user && (
          <>
            <span style={{ fontSize: '14px' }}>
              안녕하세요, {authState.user.username || authState.user.userid}님
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '5px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              로그아웃
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TopHeader;
