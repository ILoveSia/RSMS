import React from 'react';
import BaseDialog, { type BaseDialogProps } from '@/shared/components/modal/BaseDialog';
import { Box, Divider, Typography } from '@mui/material';

export interface NoticeDetailData {
  id: number;
  category?: string;
  title: string;
  pinned?: boolean;
  view_count?: number;
  created_at?: string;
  content?: string;
}

interface NoticeDetailDialogProps extends Omit<BaseDialogProps, 'title' | 'children' | 'mode'> {
  mode?: 'view';
  data?: NoticeDetailData | null;
}

const NoticeDetailDialog: React.FC<NoticeDetailDialogProps> = ({ open, onClose, data, mode = 'view', ...rest }) => {
  const header = data ? `공지 상세 (#${data.id})` : '공지 상세';

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      mode={mode}
      title={header}
      hideDefaultActions
      maxWidth='sm'
      {...rest}
    >
      {!data ? (
        <Typography variant='body2' color='text.secondary'>데이터가 없습니다.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>{data.title}</Typography>
          <Typography variant='caption' color='text.secondary'>
            {data.category || '-'} · {data.created_at || ''} · 조회 {data.view_count ?? 0}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {data.content || '(내용 없음)'}
          </Typography>
        </Box>
      )}
    </BaseDialog>
  );
};

export default NoticeDetailDialog;


