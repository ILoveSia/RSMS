import React, { useEffect, useState } from 'react';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { Box, Chip, Divider, Typography } from '@mui/material';
import TextField from '@/shared/components/ui/data-display/TextField';
import type { QnaDetailResponseDto } from '../api/qnaApi';
import qnaApi from '../api/qnaApi';
import { useToastHelpers } from '@/shared/components/ui/feedback';

interface QnaDetailDialogProps {
  open: boolean;
  qnaId?: number | null;
  onClose: () => void;
  onSaved?: () => void;
}

const QnaDetailDialog: React.FC<QnaDetailDialogProps> = ({ open, qnaId, onClose, onSaved }) => {
  const [detail, setDetail] = useState<QnaDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'edit' | 'onlyRead'>('onlyRead');
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    department: '',
    title: '',
    content: '',
    category: '',
    answerContent: '',
  });
  const [savingAnswer, setSavingAnswer] = useState(false);
  const { showSuccess } = useToastHelpers();

  useEffect(() => {
    const load = async () => {
      if (!open || !qnaId) {
        setDetail(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await qnaApi.getQnaDetail(qnaId);
        setDetail(data);
        // 상태에 따라 초기 모드 결정: PENDING이면 보기 모드(수정 버튼 노출), 아니면 읽기 전용
        const editable = data.status === 'PENDING';
        setCanEdit(editable);
        setMode(editable ? 'view' : 'onlyRead');
        // 편집 폼 초기화
        setEditForm({
          department: data.department || '',
          title: data.title || '',
          content: data.content || '',
          category: data.category || '',
          answerContent: data.answerContent || '',
        });
      } catch (e: any) {
        setError(e?.message || 'Q&A 상세를 불러오지 못했습니다.');
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, qnaId]);

  return (
    <BaseDialog
      open={open}
      mode={canEdit ? mode : 'onlyRead'}
      title="Q&A 상세"
      maxWidth="md"
      onClose={() => { setMode('onlyRead'); onClose(); }}
      onModeChange={(m) => setMode(m as any)}
      onSave={async () => {
        if (!detail || mode !== 'edit') return;
        try {
          setLoading(true);
          await qnaApi.updateQna(detail.id, {
            department: editForm.department,
            title: editForm.title,
            content: editForm.content,
            priority: detail.priority as any,
            category: editForm.category,
            isPublic: detail.isPublic,
          });
          showSuccess('수정이 완료되었습니다.');
          onSaved?.();
          onClose();
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading && <Typography>로딩 중...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {detail && !loading && !error && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h6">{detail.title}</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label={`부서: ${detail.department || '-'}`} size="small" />
            <Chip label={`작성자: ${detail.questionerName || '-'}`} size="small" />
            <Chip label={`상태: ${detail.statusDescription || '-'}`} size="small" color="primary" variant="outlined" />
            {detail.priorityDescription && <Chip label={`우선순위: ${detail.priorityDescription}`} size="small" variant="outlined" />}
            <Chip label={`공개여부: ${detail.isPublic ? '공개' : '비공개'}`} size="small" variant="outlined" />
            <Chip label={`조회수: ${detail.viewCount ?? 0}`} size="small" variant="outlined" />
          </Box>
          <Typography variant="body2" color="text.secondary">작성일: {detail.createdAtFormatted}</Typography>
          {detail.answeredAtFormatted && (
            <Typography variant="body2" color="text.secondary">답변일: {detail.answeredAtFormatted}</Typography>
          )}
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1">질문</Typography>
          {canEdit && mode === 'edit' ? (
            <>
              <TextField
                size="small"
                label="담당업무/부서"
                value={editForm.department}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                mode="editable"
              />
              <TextField
                size="small"
                label="제목"
                value={editForm.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                mode="editable"
              />
              <TextField
                size="small"
                label="내용"
                value={editForm.content}
                multiline minRows={4}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                mode="editable"
              />
              <TextField
                size="small"
                label="카테고리"
                value={editForm.category}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                mode="editable"
              />
            </>
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{detail.content}</Typography>
          )}

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1">답변</Typography>
          {detail.answerContent && detail.answerContent.trim() ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{detail.answerContent}</Typography>
          ) : canEdit ? (
            <>
              <TextField
                size="small"
                label="답변 내용"
                value={editForm.answerContent}
                multiline minRows={4}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, answerContent: e.target.value }))}
                mode="editable"
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">등록 시 상태가 ANSWERED로 변경됩니다.</Typography>
                <Button
                  size="small"
                  color="success"
                  loading={savingAnswer}
                  onClick={async () => {
                    if (!detail) return;
                    try {
                      setSavingAnswer(true);
                      const userRaw = localStorage.getItem('user');
                      const userJson = userRaw ? JSON.parse(userRaw) : {};
                      const userId = userJson?.userid || 'anonymous';
                      const userName = userJson?.username || '익명';
                      await qnaApi.addAnswer(detail.id, { answerContent: editForm.answerContent || '' }, { userId, userName });
                      showSuccess('답변이 등록되었습니다.');
                      onSaved?.();
                      onClose();
                    } finally {
                      setSavingAnswer(false);
                    }
                  }}
                  disabled={!editForm.answerContent.trim()}
                >
                  답변 저장
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">등록된 답변이 없습니다.</Typography>
          )}
        </Box>
      )}
    </BaseDialog>
  );
};

export default QnaDetailDialog;


