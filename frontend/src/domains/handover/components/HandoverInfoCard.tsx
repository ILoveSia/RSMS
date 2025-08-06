/**
 * 인수인계 정보 카드 컴포넌트
 * 인수인계 지정 정보를 카드 형태로 표시합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 정보 표시만 담당
 * - Open/Closed: 새로운 정보 항목 추가 시 확장 가능
 * - Liskov Substitution: React 컴포넌트 인터페이스 준수
 * - Interface Segregation: 인수인계 정보 표시 관련 기능만 제공
 * - Dependency Inversion: Material-UI 컴포넌트에 의존
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import { HandoverAssignmentDto } from '../api/handoverApi';
import StatusChip from './StatusChip';
import ProgressIndicator from './ProgressIndicator';

interface HandoverInfoCardProps {
  assignment: HandoverAssignmentDto;
  onView?: () => void;
  onEdit?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  compact?: boolean;
  showActions?: boolean;
}

const HandoverInfoCard: React.FC<HandoverInfoCardProps> = ({
  assignment,
  onView,
  onEdit,
  onStart,
  onComplete,
  compact = false,
  showActions = true,
}) => {
  // 인수인계 유형 표시
  const getHandoverTypeLabel = (type: string) => {
    const typeLabels = {
      POSITION_CHANGE: '직위변경',
      RETIREMENT: '퇴직',
      RESIGNATION: '사직',
      TRANSFER: '전보',
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  // 상태별 사용 가능한 액션
  const canStart = assignment.status === 'PLANNED';
  const canComplete = assignment.status === 'IN_PROGRESS';
  const canEdit = assignment.status !== 'COMPLETED';

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={getHandoverTypeLabel(assignment.handoverType)}
                size="small"
                color="primary"
                variant="outlined"
              />
              <StatusChip status={assignment.status as any} />
            </Box>
          </Box>
          
          {/* 액션 버튼 */}
          {showActions && (
            <Stack direction="row" spacing={0.5}>
              {onView && (
                <Tooltip title="상세보기">
                  <IconButton size="small" onClick={onView}>
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onEdit && canEdit && (
                <Tooltip title="수정">
                  <IconButton size="small" onClick={onEdit}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onStart && canStart && (
                <Tooltip title="시작">
                  <IconButton size="small" onClick={onStart} color="info">
                    <StartIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onComplete && canComplete && (
                <Tooltip title="완료">
                  <IconButton size="small" onClick={onComplete} color="success">
                    <CompleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          )}
        </Box>

        {/* 인계자 → 인수자 */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* 인계자 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {assignment.handoverFromName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" noWrap>
                  {assignment.handoverFromName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {assignment.deptName}
                </Typography>
              </Box>
            </Box>

            {/* 화살표 */}
            <ArrowIcon color="action" />

            {/* 인수자 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {assignment.handoverToName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" noWrap>
                  {assignment.handoverToName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {assignment.deptCodet}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* 진행률 (진행 중일 때만) */}
        {assignment.status === 'IN_PROGRESS' && assignment.progressRate !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              진행률
            </Typography>
            <ProgressIndicator
              value={assignment.progressRate}
              status={assignment.status as any}
              size="small"
            />
          </Box>
        )}

        {!compact && (
          <>
            <Divider sx={{ my: 2 }} />
            
            {/* 일정 정보 */}
            <Stack spacing={1}>
              {assignment.plannedStartDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    시작예정: {assignment.plannedStartDate}
                  </Typography>
                </Box>
              )}
              {assignment.plannedEndDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    완료예정: {assignment.plannedEndDate}
                  </Typography>
                </Box>
              )}
            </Stack>
          </>
        )}

        {/* 컴팩트 모드에서의 간단한 정보 */}
        {compact && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {assignment.plannedStartDate} ~ {assignment.plannedEndDate}
            </Typography>
            {assignment.progressRate !== undefined && assignment.progressRate > 0 && (
              <Typography variant="caption" fontWeight="bold">
                {assignment.progressRate}%
              </Typography>
            )}
          </Box>
        )}

        {/* 비고 (있는 경우만) */}
        {!compact && assignment.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary" gutterBottom>
              비고
            </Typography>
            <Typography variant="body2" sx={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {assignment.notes}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HandoverInfoCard;