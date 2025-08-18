import { useAuth } from '@/shared/context/AuthContext';
import ThemeToggle from '@/app/components/config/ThemeToggle';
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
      
      
      // AuthContext의 logout 함수 호출 (모든 데이터 정리 포함)
      logout();

      // 완전한 상태 초기화를 위해 페이지 새로고침과 함께 로그인 페이지로 이동
      window.location.href = '/login';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>ITCEN Solution</div>
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 12px',
            borderRadius: '20px',
            background: 'var(--bank-primary-bg)',
            border: '1px solid var(--bank-border)',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'var(--bank-text-primary)',
          }}
        >
          <span>PROTOTYPE</span>
          <span style={{ fontSize: '11px', opacity: 0.9 }}>v0.1.0</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <ThemeToggle />
        {authState.isAuthenticated && authState.user && (
          <>
            <span style={{ fontSize: '14px' }}>
              안녕하세요, {authState.user.username || authState.user.userid}님
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'var(--bank-primary-bg)',
                border: '1px solid var(--bank-border)',
                color: 'var(--bank-text-primary)',
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
