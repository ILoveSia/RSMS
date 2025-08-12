import React, { useEffect, useMemo, useState } from 'react';
import BaseDialog from '@/shared/components/modal/BaseDialog';
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
  const isEditable = useMemo(() => detail?.status === 'PENDING', [detail?.status]);
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
        setMode(data.status === 'PENDING' ? 'view' : 'onlyRead');
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
      mode={isEditable ? mode : 'onlyRead'}
      title="Q&A 상세"
      maxWidth="md"
      onClose={() => { setMode('onlyRead'); onClose(); }}
      onModeChange={(m) => setMode(m as any)}
      onSave={async () => {
        if (!detail || mode !== 'edit') return;
        try {
          setLoading(true);
          // 업데이트 API (백엔드는 PENDING일 때만 허용)
          await qnaApi.updateQna(detail.id, {
            department: detail.department,
            title: detail.title,
            content: detail.content,
            priority: detail.priority as any,
            category: detail.category,
            isPublic: detail.isPublic,
          });
          showSuccess('수정이 완료되었습니다.');
          onSaved?.();
          setMode('onlyRead');
          onClose();
          // 저장 후 최신 데이터 재조회
          // (닫으므로 재조회는 생략)
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
          {isEditable && mode === 'edit' ? (
            <>
              <TextField
                size="small"
                label="담당업무/부서"
                value={detail.department}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetail({ ...detail, department: e.target.value })}
                mode="editable"
              />
              <TextField
                size="small"
                label="제목"
                value={detail.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetail({ ...detail, title: e.target.value })}
                mode="editable"
              />
              <TextField
                size="small"
                label="내용"
                value={detail.content}
                multiline minRows={4}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetail({ ...detail, content: e.target.value })}
                mode="editable"
              />
              <TextField
                size="small"
                label="카테고리"
                value={detail.category || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetail({ ...detail, category: e.target.value })}
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
          ) : (
            <Typography variant="body2" color="text.secondary">등록된 답변이 없습니다.</Typography>
          )}
        </Box>
      )}
    </BaseDialog>
  );
};

export default QnaDetailDialog;


