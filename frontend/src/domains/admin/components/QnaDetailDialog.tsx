import React, { useEffect, useState } from 'react';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Box, Chip, Divider, Typography } from '@mui/material';
import type { QnaDetailResponseDto } from '../api/qnaApi';
import qnaApi from '../api/qnaApi';

interface QnaDetailDialogProps {
  open: boolean;
  qnaId?: number | null;
  onClose: () => void;
}

const QnaDetailDialog: React.FC<QnaDetailDialogProps> = ({ open, qnaId, onClose }) => {
  const [detail, setDetail] = useState<QnaDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      mode="onlyRead"
      title="Q&A 상세"
      maxWidth="md"
      onClose={onClose}
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
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{detail.content}</Typography>

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1">답변</Typography>
          {detail.answerContent && detail.answerContent.trim() ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{detail.answerContent}</Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">등록된 답변이 없습니다.</Typography>
          )}
        </Box>
      )}
    </BaseDialog>
  );
};

export default QnaDetailDialog;


