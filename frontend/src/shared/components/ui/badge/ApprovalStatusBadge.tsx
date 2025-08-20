import { Box, type SxProps, type Theme } from '@mui/material';
import React from 'react';

export type ApprovalStatus = 'NONE' | 'SUBMITTED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';

interface ApprovalStatusBadgeProps {
  status?: ApprovalStatus | string | null;
  sx?: SxProps<Theme>;
}

/**
 * 결재 상태를 텍스트와 색상으로 표시하는 뱃지 컴포넌트입니다.
 */
export const ApprovalStatusBadge = ({ status, sx }: ApprovalStatusBadgeProps): React.JSX.Element => {
  let statusText = '';
  let statusColor = '#666'; // Default color

  switch (status) {
    case 'NONE':
      statusText = '미결재';
      statusColor = '#999';
      break;
    case 'SUBMITTED':
      statusText = '상신';
      statusColor = '#2196f3';
      break;
    case 'IN_PROGRESS':
      statusText = '진행중';
      statusColor = '#ff9800';
      break;
    case 'APPROVED':
      statusText = '승인';
      statusColor = '#4caf50';
      break;
    case 'REJECTED':
      statusText = '반려';
      statusColor = '#f44336';
      break;
    default:
      statusText = status || '미결재';
      statusColor = '#999';
  }

  return (
    <Box
      component="span"
      sx={{
        color: statusColor,
        fontSize: '0.875rem',
        fontWeight: 500,
        ...sx,
      }}
    >
      {statusText}
    </Box>
  );
};
