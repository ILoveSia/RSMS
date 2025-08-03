/**
 * 결재자 선택 컴포넌트
 * 3차 결재자를 순차적으로 선택할 수 있습니다.
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import approvalApi, { ApproverInfo } from '@/domains/approval/api/approvalApi';

// 결재자 선택 정보
interface ApproverSelection {
  step1?: string;
  step2?: string;
  step3?: string;
}

// Props 인터페이스
interface ApproverSelectorProps {
  value: ApproverSelection;
  onChange: (selection: ApproverSelection) => void;
  required?: boolean[]; // [1차, 2차, 3차] 필수 여부
  disabled?: boolean;
}

/**
 * 결재자 선택기
 */
const ApproverSelector: React.FC<ApproverSelectorProps> = ({
  value,
  onChange,
  required = [true, false, false],
  disabled = false,
}) => {
  // 결재자 목록
  const [approvers, setApprovers] = useState<ApproverInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // 결재자 목록 로드
  useEffect(() => {
    loadApprovers();
  }, []);

  const loadApprovers = async () => {
    try {
      setLoading(true);
      const approverList = await approvalApi.getAvailableApprovers();
      setApprovers(approverList);
    } catch (error) {
      console.error('결재자 목록 로드 실패:', error);
      // 임시 데이터 (실제 구현 시 제거)
      setApprovers([
        { userId: 'user001', userName: '김팀장', departmentName: '개발팀', positionName: '팀장', isAvailable: true },
        { userId: 'user002', userName: '박부장', departmentName: '개발본부', positionName: '부장', isAvailable: true },
        { userId: 'user003', userName: '이상무', departmentName: '경영진', positionName: '상무', isAvailable: true },
        { userId: 'user004', userName: '최차장', departmentName: '개발팀', positionName: '차장', isAvailable: true },
        { userId: 'user005', userName: '정과장', departmentName: '기획팀', positionName: '과장', isAvailable: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 단계별 선택 변경 핸들러
  const handleStepChange = (step: 1 | 2 | 3, approverId: string) => {
    const newSelection = { ...value };
    
    if (step === 1) {
      newSelection.step1 = approverId;
      // 1차 변경 시 2차, 3차 초기화
      newSelection.step2 = undefined;
      newSelection.step3 = undefined;
    } else if (step === 2) {
      newSelection.step2 = approverId;
      // 2차 변경 시 3차 초기화
      newSelection.step3 = undefined;
    } else if (step === 3) {
      newSelection.step3 = approverId;
    }
    
    onChange(newSelection);
  };

  // 선택 가능한 결재자 필터링 (중복 제거)
  const getAvailableApprovers = (step: 1 | 2 | 3): ApproverInfo[] => {
    const selectedIds = [value.step1, value.step2, value.step3].filter(Boolean);
    return approvers.filter(approver => 
      approver.isAvailable && !selectedIds.includes(approver.userId)
    );
  };

  // Select 변경 핸들러
  const createSelectHandler = (step: 1 | 2 | 3) => (event: SelectChangeEvent) => {
    const approverId = event.target.value;
    if (approverId) {
      handleStepChange(step, approverId);
    }
  };

  // 결재자 표시명 생성
  const getApproverDisplayName = (approver: ApproverInfo): string => {
    return `${approver.userName} (${approver.departmentName} ${approver.positionName})`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {/* 1차 결재자 */}
      <Box sx={{ minWidth: 200 }}>
        <FormControl fullWidth size="small">
          <InputLabel required={required[0]}>1차 결재자</InputLabel>
          <Select
            value={value.step1 || ''}
            onChange={createSelectHandler(1)}
            disabled={disabled || loading}
            label={`1차 결재자${required[0] ? ' *' : ''}`}
          >
            <MenuItem value="">
              <em>선택하세요</em>
            </MenuItem>
            {getAvailableApprovers(1).map((approver) => (
              <MenuItem key={approver.userId} value={approver.userId}>
                {getApproverDisplayName(approver)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 화살표 */}
      <ArrowForwardIcon color="action" sx={{ display: { xs: 'none', sm: 'block' } }} />

      {/* 2차 결재자 */}
      <Box sx={{ minWidth: 200 }}>
        <FormControl fullWidth size="small">
          <InputLabel required={required[1]}>2차 결재자</InputLabel>
          <Select
            value={value.step2 || ''}
            onChange={createSelectHandler(2)}
            disabled={disabled || loading || !value.step1}
            label={`2차 결재자${required[1] ? ' *' : ''}`}
          >
            <MenuItem value="">
              <em>선택하세요</em>
            </MenuItem>
            {getAvailableApprovers(2).map((approver) => (
              <MenuItem key={approver.userId} value={approver.userId}>
                {getApproverDisplayName(approver)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 화살표 */}
      <ArrowForwardIcon color="action" sx={{ display: { xs: 'none', sm: 'block' } }} />

      {/* 3차 결재자 */}
      <Box sx={{ minWidth: 200 }}>
        <FormControl fullWidth size="small">
          <InputLabel required={required[2]}>3차 결재자</InputLabel>
          <Select
            value={value.step3 || ''}
            onChange={createSelectHandler(3)}
            disabled={disabled || loading || !value.step2}
            label={`3차 결재자${required[2] ? ' *' : ''}`}
          >
            <MenuItem value="">
              <em>선택하세요</em>
            </MenuItem>
            {getAvailableApprovers(3).map((approver) => (
              <MenuItem key={approver.userId} value={approver.userId}>
                {getApproverDisplayName(approver)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 모바일용 설명 */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }}>
        <Typography variant="caption" color="textSecondary">
          * 1차 결재자를 먼저 선택하면 2차, 3차 결재자를 선택할 수 있습니다.
        </Typography>
      </Box>
    </Box>
  );
};

export default ApproverSelector;