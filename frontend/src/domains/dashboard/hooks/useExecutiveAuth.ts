import { useState, useEffect } from 'react';
import { executiveDashboardApi, type ExecutiveInfo } from '../api/executiveDashboardApi';

/**
 * 임원 권한 확인 커스텀 훅
 */
export const useExecutiveAuth = (empId: string) => {
  const [isExecutive, setIsExecutive] = useState(false);
  const [executiveInfo, setExecutiveInfo] = useState<ExecutiveInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!empId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const authResult = await executiveDashboardApi.checkExecutiveAuth(empId);
        
        setIsExecutive(authResult.isExecutive);
        
        if (authResult.isExecutive) {
          setExecutiveInfo({
            execofficerId: authResult.execofficerId || 0,
            empId: authResult.empId || empId,
            positionsId: authResult.positionsId || 0,
            positionsName: authResult.positionsName,
            ledgerOrder: authResult.ledgerOrder || 0,
            isExecutive: true,
            departmentCount: authResult.departmentCount
          });
        } else {
          setExecutiveInfo(null);
        }
      } catch (err) {
        console.error('Executive auth check failed:', err);
        setIsExecutive(false);
        setExecutiveInfo(null);
        setError(err instanceof Error ? err.message : '임원 권한 확인에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [empId]);
  
  return { 
    isExecutive, 
    executiveInfo, 
    loading, 
    error,
    refetch: () => {
      if (empId) {
        setLoading(true);
        // useEffect가 다시 실행되도록 트리거
      }
    }
  };
};