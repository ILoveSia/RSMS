import React, { useState } from 'react';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Box, FormControl, InputLabel } from '@mui/material';
import TextField from '@/shared/components/ui/data-display/TextField';
import CommonCodeSelect from '@/shared/components/ui/form/CommonCodeSelect';
import type { QnaPriority } from '@/app/types/qna';
import { useDialog } from '@/shared/hooks/useDialog';

export interface QnaCreateForm {
  title: string;
  content?: string;
  category?: string;
  isPublic: boolean;
  priority?: QnaPriority;
}

interface QnaCreateDialogProps {
  onClose: () => void;
  onSubmit: (form: QnaCreateForm) => Promise<void> | void;
  loading?: boolean;
}

const QnaCreateDialog: React.FC<QnaCreateDialogProps> = ({ onClose, onSubmit, loading = false }) => {
  const initialForm: QnaCreateForm = {
    title: '',
    content: '',
    category: '',
    isPublic: true,
  };
  const [form, setForm] = useState<QnaCreateForm>(initialForm);

  // 다이얼로그 상태 관리 (useDialog 훅 사용)
  const {
    dialogOpen: open,
    openDialog,
    closeDialog
  } = useDialog();

  // 컴포넌트가 마운트될 때 다이얼로그 열기
  React.useEffect(() => {
    openDialog('create');
  }, [openDialog]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    await onSubmit({
      title: form.title.trim(),
      content: form.content?.trim() || undefined,
      category: form.category?.trim() || undefined,
      isPublic: true,
    });
    setForm(initialForm);
  };

  const handleClose = () => {
    setForm(initialForm);
    // useDialog의 closeDialog 호출
    closeDialog();
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      mode="create"
      title="Q&A 등록"
      onClose={handleClose}
      onSave={handleSave}
      disableSave={!form.title.trim()}
      loading={loading}
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 420 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            label="제목"
            value={form.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, title: e.target.value }))}
            mode="editable"
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ width: 200 }}>
            {!form.category && <InputLabel>카테고리</InputLabel>}
            <CommonCodeSelect
              groupCode="CATEGORY"
              value={form.category || ''}
              onChange={(value) => setForm(f => ({ ...f, category: value }))}
              includeAll={false}
              // placeholder="카테고리 선택"
            />
          </FormControl>
        </Box>
        <TextField
          size="small"
          label="내용"
          value={form.content}
          multiline minRows={4}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, content: e.target.value }))}
          mode="editable"
        />
      </Box>
    </BaseDialog>
  );
};

export default QnaCreateDialog;


