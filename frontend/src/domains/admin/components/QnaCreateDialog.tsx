import React, { useState } from 'react';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Box } from '@mui/material';
import TextField from '@/shared/components/ui/data-display/TextField';
import type { QnaPriority } from '@/app/types/qna';

export interface QnaCreateForm {
  department: string;
  title: string;
  content?: string;
  category?: string;
  isPublic: boolean;
  priority?: QnaPriority;
}

interface QnaCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: QnaCreateForm) => Promise<void> | void;
  loading?: boolean;
}

const QnaCreateDialog: React.FC<QnaCreateDialogProps> = ({ open, onClose, onSubmit, loading = false }) => {
  const initialForm: QnaCreateForm = {
    department: '',
    title: '',
    content: '',
    category: '',
    isPublic: true,
  };
  const [form, setForm] = useState<QnaCreateForm>(initialForm);

  const handleSave = async () => {
    if (!form.department.trim() || !form.title.trim()) return;
    await onSubmit({
      department: form.department.trim(),
      title: form.title.trim(),
      content: form.content?.trim() || undefined,
      category: form.category?.trim() || undefined,
      isPublic: true,
    });
    setForm(initialForm);
  };

  const handleClose = () => {
    setForm(initialForm);
    onClose();
  };

  // remount + onClose 시 초기화로 충분하므로 별도 open 감시 초기화는 제거

  return (
    <BaseDialog
      open={open}
      mode="create"
      title="Q&A 등록"
      onClose={handleClose}
      onSave={handleSave}
      disableSave={!form.department.trim() || !form.title.trim()}
      loading={loading}
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 420 }}>
        <TextField
          size="small"
          label="담당업무/부서"
          value={form.department}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, department: e.target.value }))}
          mode="editable"
        />
        <TextField
          size="small"
          label="제목"
          value={form.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, title: e.target.value }))}
          mode="editable"
        />
        <TextField
          size="small"
          label="내용"
          value={form.content}
          multiline minRows={4}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, content: e.target.value }))}
          mode="editable"
        />
        <TextField
          size="small"
          label="카테고리"
          value={form.category}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, category: e.target.value }))}
          mode="editable"
        />
      </Box>
    </BaseDialog>
  );
};

export default QnaCreateDialog;


