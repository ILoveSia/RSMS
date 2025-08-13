import {
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Box, Chip, IconButton, InputAdornment, Stack } from '@mui/material';
import { TextField } from '@/shared/components/ui/data-display';
import React, { useCallback, useEffect, useState } from 'react';

interface SearchFilter {
  key: string;
  label: string;
  value: string;
}

interface SearchBoxProps {
  placeholder?: string;
  value?: string;
  onSearch?: (query: string, filters: SearchFilter[]) => void;
  onClear?: () => void;
  disabled?: boolean;
  filters?: SearchFilter[];
  onFiltersChange?: (filters: SearchFilter[]) => void;
  showFilterButton?: boolean;
  className?: string;
}

/**
 * 새로운 패턴을 사용하는 검색 컴포넌트
 * - 통합 검색과 필터 기능
 * - 재사용 가능한 디자인
 */
const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = '검색어를 입력하세요',
  value = '',
  onSearch,
  onClear,
  disabled = false,
  filters = [],
  onFiltersChange,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState(value);

  // 검색 실행
  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch(searchQuery.trim(), filters);
    }
  }, [searchQuery, filters, onSearch]);

  // 입력 변경 시 자동 검색 (디바운스)
  useEffect(() => {
    if (!onSearch) return;
    const timer = setTimeout(() => {
      onSearch(searchQuery.trim(), filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filters, onSearch]);

  // 검색어 변경
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // 검색어 지우기
  const handleClear = () => {
    setSearchQuery('');
    if (onClear) {
      onClear();
    }
  };

  // 필터 제거
  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = filters.filter(f => f.key !== filterKey);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  return (
    <Box className={className} sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label=''
          mode='editable'
          fullWidth
          variant='outlined'
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleQueryChange}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon color='action' />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position='end'>
                <IconButton size='small' onClick={handleClear} disabled={disabled}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            },
          }}
        />
      </Box>

      {/* 활성 필터 표시 */}
      {filters.length > 0 && (
        <Stack direction='row' spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
          {filters.map(filter => (
            <Chip
              key={filter.key}
              label={`${filter.label}: ${filter.value}`}
              size='small'
              variant='outlined'
              onDelete={() => handleRemoveFilter(filter.key)}
              sx={{
                '& .MuiChip-deleteIcon': {
                  fontSize: '16px',
                },
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default SearchBox;
