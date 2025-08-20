import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { Box, Tooltip, type SxProps, type Theme } from '@mui/material';
import React from 'react';

interface AttachmentBadgeProps {
  /**
   * 표시할 첨부파일의 개수
   */
  count?: number | null;
  /**
   * MUI SxProp을 사용하여 추가적인 스타일을 적용할 수 있습니다.
   */
  sx?: SxProps<Theme>;
}

/**
 * 첨부파일의 개수를 아이콘과 함께 표시하는 뱃지 컴포넌트입니다.
 * count가 0, null, undefined이면 '-'를 표시합니다.
 */
export const AttachmentBadge = ({
  count,
  sx,
}: AttachmentBadgeProps): React.JSX.Element => {
  if (!count) {
    return <span style={{ fontSize: '0.75rem', color: '#999' }}>-</span>;
  }

  return (
    <Tooltip title={`첨부파일 ${count}개`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ...sx }}>
        <AttachFileIcon fontSize="small" color="primary" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>{count}</span>
      </Box>
    </Tooltip>
  );
};
