/**
 * 부서장 원장차수 선택 SelectBox 공통 컴포넌트
 * - 부서장 원장차수 목록 자동 로드
 * - 로딩 상태 및 에러 처리
 * - "전체" 옵션 자동 추가 지원
 * - 커스터마이징 가능한 props
 */
import { Select } from '@/shared/components/ui';
import type { SelectOption } from '@/shared/types/common';
import type { SxProps, Theme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '@/app/common/api/client';

export interface LedgerOrdersHodSelectProps {
  /** 선택된 값 */
  value: string;
  /** 값 변경 핸들러 - value, ledgerOrdersHodId, ledgerOrdersHodStatusCd를 함께 전달 */
  onChange: (value: string, ledgerOrdersHodId?: number, ledgerOrdersHodStatusCd?: string) => void;
  /** 라벨 텍스트 */
  label?: string;
  /** 컴포넌트 크기 */
  size?: 'small' | 'medium';
  /** 커스텀 스타일 */
  sx?: SxProps<Theme>;
  /** "전체" 옵션 포함 여부 (기본값: true) */
  includeAll?: boolean;
  /** "전체" 옵션 라벨 (기본값: "전체") */
  allLabel?: string;
  /** "전체" 옵션 값 (기본값: "ALL") */
  allValue?: string;
  /** 새로고침 트리거 - 값이 변경되면 데이터를 다시 로드 */
  refreshTrigger?: number;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 에러 상태 */
  error?: boolean;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 최소 너비 */
  minWidth?: number | string;
  /** 최대 너비 */
  maxWidth?: number | string;
  /** 로딩 완료 콜백 */
  onLoadComplete?: (options: LedgerOrdersHodOption[]) => void;
  /** 에러 발생 콜백 */
  onError?: (error: string) => void;
}

export interface LedgerOrdersHodOption {
  value: string;
  label: string;
  ledgerOrdersHodId: number;
  ledgerOrdersHodStatusCd: string;
}

// 부서장 원장차수 API 함수
const fetchLedgerOrdersHodSelectList = async (): Promise<LedgerOrdersHodOption[]> => {
  const response = await apiClient.get<LedgerOrdersHodOption[]>('/positions/ledger-orders-hod/select-list');
  return response || [];
};

const LedgerOrdersHodSelect: React.FC<LedgerOrdersHodSelectProps> = ({
  value,
  onChange,
  label,
  size = 'small',
  sx,
  includeAll = true,
  allLabel = '전체',
  allValue = 'ALL',
  refreshTrigger,
  placeholder,
  disabled = false,
  error = false,
  helperText,
  minWidth = 150,
  maxWidth = 200,
  onLoadComplete,
  onError,
}) => {
  // 부서장 원장차수 옵션 상태
  const [ledgerOrdersHodOptions, setLedgerOrdersHodOptions] = useState<LedgerOrdersHodOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 부서장 원장차수 목록 조회
  const fetchLedgerOrdersHod = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await fetchLedgerOrdersHodSelectList();
      setLedgerOrdersHodOptions(data);

      // 로딩 완료 콜백 호출
      if (onLoadComplete) {
        onLoadComplete(data);
      }
    } catch (err: unknown) {
      const errorMessage = '부서장 원장차수 목록을 불러오는데 실패했습니다.';
      console.error('부서장 원장차수 목록 조회 실패:', err);
      setLoadError(errorMessage);

      // 에러 콜백 호출
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [onLoadComplete, onError]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchLedgerOrdersHod();
  }, [fetchLedgerOrdersHod, refreshTrigger]);

  // SelectBox 옵션 생성
  const getSelectOptions = useCallback((): SelectOption[] => {
    const options: SelectOption[] = [];

    // "전체" 옵션 추가 (항상 첫 번째에 추가)
    if (includeAll) {
      options.push({
        value: allValue,
        label: allLabel,
      });
    }

    // includeAll이 false인 경우 기본 placeholder 옵션 추가
    if (!includeAll && placeholder) {
      options.push({
        value: '',
        label: placeholder,
      });
    }

    // 에러 발생 시
    if (loadError) {
      if (!includeAll && !placeholder) {
        options.push({
          value: 'error',
          label: '로드 실패',
          disabled: true,
        });
      }
      return options;
    }

    // 로딩 중일 때 (전체 옵션은 유지)
    if (loading) {
      if (!includeAll && !placeholder) {
        options.push({
          value: 'loading',
          label: '데이터 로딩 중...',
          disabled: true,
        });
      }
      return options;
    }

    // 부서장 원장차수 옵션 추가
    if (ledgerOrdersHodOptions.length > 0) {
      ledgerOrdersHodOptions.forEach(option => {
        options.push({
          value: option.value,
          label: option.label,
          // SelectOption에는 추가 필드가 없으므로 data로 저장
          data: { 
            ledgerOrdersHodId: option.ledgerOrdersHodId,
            ledgerOrdersHodStatusCd: option.ledgerOrdersHodStatusCd
          }
        });
      });
    } else {
      // 데이터가 없는 경우 (전체 옵션은 유지)
      if (!includeAll && !placeholder) {
        options.push({
          value: 'no-data',
          label: '데이터 없음',
          disabled: true,
        });
      }
    }

    return options;
  }, [includeAll, allValue, allLabel, loading, loadError, ledgerOrdersHodOptions, placeholder]);

  // 값 변경 핸들러 - Select 컴포넌트의 onChange 타입에 맞춤
  const handleChange = useCallback(
    (newValue: string | number | string[] | number[]) => {
      let valueString: string;
      
      if (typeof newValue === 'string') {
        valueString = newValue;
      } else if (typeof newValue === 'number') {
        valueString = String(newValue);
      } else if (Array.isArray(newValue) && newValue.length > 0) {
        valueString = String(newValue[0]);
      } else {
        return;
      }

      // "전체" 또는 allValue인 경우 추가 정보 없이 호출
      if (valueString === allValue) {
        onChange(valueString);
        return;
      }

      // 선택된 값에 해당하는 데이터 찾기
      const selectedOption = ledgerOrdersHodOptions.find(option => option.value === valueString);
      const ledgerOrdersHodId = selectedOption?.ledgerOrdersHodId;
      const ledgerOrdersHodStatusCd = selectedOption?.ledgerOrdersHodStatusCd;
      
      onChange(valueString, ledgerOrdersHodId, ledgerOrdersHodStatusCd);
    },
    [onChange, allValue, ledgerOrdersHodOptions]
  );

  return (
    <Select
      value={value}
      onChange={handleChange}
      label={label}
      size={size}
      options={getSelectOptions()}
      disabled={disabled} // loading 제거 - 로딩 중에도 "전체" 옵션 선택 가능
      error={error || !!loadError}
      displayEmpty={true} // 빈 값도 표시되도록 설정
      sx={{
        minWidth,
        maxWidth,
        // 로딩 중일 때 스타일 조정
        ...(loading && {
          '& .MuiSelect-select': {
            opacity: 0.7,
          },
        }),
        ...sx,
      }}
      helperText={helperText || loadError || (loading ? '데이터 로딩 중...' : undefined)}
    />
  );
};

export default LedgerOrdersHodSelect;