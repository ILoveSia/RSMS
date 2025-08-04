/**
 * 직책 선택 컴포넌트
 * 직책 선택 기능을 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책 선택만 담당
 * - Open/Closed: 새로운 직책이나 필터 추가 시 확장 가능
 * - Liskov Substitution: React 컴포넌트 인터페이스 준수
 * - Interface Segregation: 직책 선택 관련 기능만 제공
 * - Dependency Inversion: Material-UI Select에 의존
 */

import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import {
  Business as BusinessIcon,
} from '@mui/icons-material';

// 직책 정보 타입
export interface Position {
  id: number;
  name: string;
  description: string;
  level?: number;
  department?: string;
}

interface PositionSelectorProps {
  label?: string;
  value?: number | number[];
  onChange: (value: number | number[]) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  size?: 'small' | 'medium';
  departmentFilter?: string;
  levelFilter?: number;
  fullWidth?: boolean;
}

// Mock 데이터 - 실제로는 API에서 가져옴
const mockPositions: Position[] = [
  { id: 1, name: '부서장', description: '부서 관리자', level: 1, department: '전체' },
  { id: 2, name: '팀장', description: '팀 리더', level: 2, department: '전체' },
  { id: 3, name: '선임', description: '선임 직책', level: 3, department: '전체' },
  { id: 4, name: '주임', description: '주임 직책', level: 4, department: '전체' },
  { id: 5, name: '사원', description: '일반 사원', level: 5, department: '전체' },
  { id: 6, name: 'PM', description: '프로젝트 매니저', level: 2, department: '정보기술부' },
  { id: 7, name: '시스템분석가', description: '시스템 분석 전문가', level: 3, department: '정보기술부' },
  { id: 8, name: '보안담당자', description: '정보보안 담당자', level: 3, department: '보안부' },
];

const PositionSelector: React.FC<PositionSelectorProps> = ({
  label = '직책 선택',
  value,
  onChange,
  error = false,
  helperText,
  required = false,
  disabled = false,
  multiple = false,
  size = 'medium',
  departmentFilter,
  levelFilter,
  fullWidth = true,
}) => {
  const [options, setOptions] = useState<Position[]>([]);

  // 직책 목록 로드
  useEffect(() => {
    loadPositions();
  }, [departmentFilter, levelFilter]);

  const loadPositions = async () => {
    try {
      // TODO: 실제 API 호출로 대체
      // const response = await PositionApi.getPositions({
      //   department: departmentFilter,
      //   level: levelFilter,
      // });
      
      // Mock 데이터 필터링
      let filteredPositions = mockPositions;
      
      if (departmentFilter) {
        filteredPositions = filteredPositions.filter(pos => 
          pos.department === '전체' || pos.department === departmentFilter
        );
      }
      
      if (levelFilter) {
        filteredPositions = filteredPositions.filter(pos => 
          pos.level === levelFilter
        );
      }
      
      setOptions(filteredPositions);
    } catch (error) {
      console.error('직책 목록 로드 실패:', error);
      setOptions([]);
    }
  };

  // 선택 변경 처리
  const handleChange = (event: SelectChangeEvent<number | number[]>) => {
    const selectedValue = event.target.value;
    onChange(selectedValue as number | number[]);
  };

  // 선택된 값 표시
  const renderValue = (selected: number | number[]) => {
    if (multiple && Array.isArray(selected)) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selected.map((value) => {
            const position = options.find(pos => pos.id === value);
            return (
              <Chip 
                key={value} 
                label={position?.name || value} 
                size={size}
                color="primary"
                variant="outlined"
              />
            );
          })}
        </Box>
      );
    } else {
      const position = options.find(pos => pos.id === selected);
      return position ? `${position.name} - ${position.description}` : '';
    }
  };

  return (
    <FormControl 
      fullWidth={fullWidth}
      error={error}
      required={required}
      disabled={disabled}
      size={size}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || (multiple ? [] : '')}
        onChange={handleChange}
        label={label}
        multiple={multiple}
        renderValue={multiple ? renderValue : undefined}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
      >
        {options.map((position) => (
          <MenuItem key={position.id} value={position.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <BusinessIcon fontSize="small" color="action" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1">
                  {position.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {position.description}
                  {position.level && ` | Level ${position.level}`}
                  {position.department && position.department !== '전체' && ` | ${position.department}`}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5, ml: 1.75 }}>
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
};

export default PositionSelector;