import { useMutation, useQuery } from '@/shared/hooks';
import { PositionApiService } from '../api/positionApi';

/**
 * 직책 현황 목록 조회 훅
 */
export const usePositionStatusList = () => {
  return useQuery('positionStatusList', PositionApiService.getStatusList, {
    refetchOnMount: true,
  });
};

/**
 * 원장차수 선택 목록 조회 훅
 */
export const useLedgerOrderSelectList = () => {
  return useQuery('ledgerOrderSelectList', PositionApiService.getLedgerOrderSelectList, {
    refetchOnMount: true,
  });
};

/**
 * 직책 일괄 삭제 mutation 훅
 */
export const useDeletePositions = () => {
  return useMutation<void, number[]>(PositionApiService.deleteBulk, {
    onError: error => {
      console.error('직책 삭제 실패:', error.message);
    },
  });
};

/**
 * Position 도메인 종합 훅
 * 여러 데이터를 한번에 관리할 때 사용
 */
export const usePosition = () => {
  const statusList = usePositionStatusList();
  const ledgerOrderList = useLedgerOrderSelectList();
  const deletePositions = useDeletePositions();

  return {
    // 데이터
    statusList: statusList.data,
    ledgerOrderList: ledgerOrderList.data,

    // 로딩 상태
    loading: statusList.loading || ledgerOrderList.loading,

    // 에러 상태
    error: statusList.error || ledgerOrderList.error,

    // 액션들
    refetchStatusList: statusList.refetch,
    refetchLedgerOrderList: ledgerOrderList.refetch,
    deletePositions: deletePositions.mutate,
    deletingPositions: deletePositions.loading,
    deleteError: deletePositions.error,
  };
};
