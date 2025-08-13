import React, { useState } from 'react';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Box, FormControlLabel, Switch, TextField } from '@mui/material';

interface NoticeCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { category?: string; title: string; content?: string; pinned?: boolean }) => Promise<void> | void;
  loading?: boolean;
}

const NoticeCreateDialog: React.FC<NoticeCreateDialogProps> = ({ open, onClose, onSubmit, loading }) => {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      mode='create'
      title='공지 등록'
      onSave={async () => { await onSubmit({ category: category || undefined, title, content: content || undefined, pinned }); }}
      disableSave={!title.trim()}
      loading={loading}
      maxWidth='sm'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label='카테고리' size='small' value={category} onChange={e => setCategory(e.target.value)} />
        <TextField label='제목' size='small' value={title} onChange={e => setTitle(e.target.value)} required />
        <TextField label='내용' minRows={6} multiline value={content} onChange={e => setContent(e.target.value)} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel control={<Switch checked={pinned} onChange={e => setPinned(e.target.checked)} />} label='상단고정' />
        </Box>
      </Box>
    </BaseDialog>
  );
};

export default NoticeCreateDialog;


