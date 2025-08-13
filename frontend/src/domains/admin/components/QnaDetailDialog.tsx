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

  // 임시 로컬 댓글 상태 (DB 연동 전)
  interface LocalComment {
    id: number;
    parentId: number | null;
    content: string;
    author: string;
    createdAt: string;
  }

  const [comments, setComments] = useState<LocalComment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');

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
        // 댓글 불러오기 (백엔드 연결)
        try {
          const serverComments = await qnaApi.getComments(qnaId);
          // 서버 DTO -> 로컬 렌더 타입으로 변환 (작성자/시간은 서버 createdId/createdAt 사용)
          const mapped: LocalComment[] = serverComments.map(c => ({
            id: Number(c.id),
            parentId: c.parentId ?? null,
            content: c.isDeleted ? '[삭제됨]' : c.content,
            author: c.createdId || '익명',
            createdAt: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
          }));
          setComments(mapped);
        } catch {
          // 댓글 API 실패는 상세 로딩을 막지 않음
          setComments([]);
        }
      } catch (e: any) {
        setError(e?.message || 'Q&A 상세를 불러오지 못했습니다.');
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, qnaId]);

  // 댓글 렌더링 (계층 구조)
  const renderComments = (parentId: number | null, depth: number = 0): React.ReactNode => {
    const items = comments.filter(c => c.parentId === parentId);
    if (items.length === 0) return null;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((c) => (
          <Box key={c.id} sx={{ ml: depth * 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2">{c.author}</Typography>
              <Typography variant="caption" color="text.secondary">{c.createdAt}</Typography>
            </Box>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{c.content}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Button size="small" variant="text" onClick={() => { setReplyingTo(c.id); setReplyContent(''); }}>답글</Button>
            </Box>
            {replyingTo === c.id && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  label="답글"
                  placeholder="답글을 입력하세요"
                  value={replyContent}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyContent(e.target.value)}
                  mode="editable"
                  fullWidth
                />
                <Button
                  size="small"
                  onClick={async () => {
                    const text = replyContent.trim();
                    if (!text) return;
                    const userRaw = localStorage.getItem('user');
                    const userJson = userRaw ? JSON.parse(userRaw) : {};
                    const userId = userJson?.userid || 'anonymous';
                    await qnaApi.addComment(detail!.id, { content: text, parentId: c.id }, { userId });
                    const serverComments = await qnaApi.getComments(detail!.id);
                    const mapped: LocalComment[] = serverComments.map(sc => ({
                      id: Number(sc.id),
                      parentId: sc.parentId ?? null,
                      content: sc.isDeleted ? '[삭제됨]' : sc.content,
                      author: sc.createdId || '익명',
                      createdAt: sc.createdAt ? new Date(sc.createdAt).toLocaleString() : '',
                    }));
                    setComments(mapped);
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  disabled={!replyContent.trim()}
                >등록</Button>
                <Button size="small" variant="outlined" onClick={() => { setReplyingTo(null); setReplyContent(''); }}>취소</Button>
              </Box>
            )}
            <Box sx={{ mt: 1 }}>
              {renderComments(c.id, depth + 1)}
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

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
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1">댓글</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* 댓글 목록 (DB 연동 전 로컬 상태) */}
            {comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">등록된 댓글이 없습니다.</Typography>
            ) : (
              <Box sx={{ mt: 0.5 }}>
                {renderComments(null, 0)}
              </Box>
            )}

            {/* 신규 댓글 입력 (최상위) */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                size="small"
                label="댓글"
                placeholder="댓글을 입력하세요"
                value={newComment}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
                mode="editable"
                fullWidth
              />
              <Button
                size="small"
                onClick={async () => {
                  const text = newComment.trim();
                  if (!text) return;
                  const userRaw = localStorage.getItem('user');
                  const userJson = userRaw ? JSON.parse(userRaw) : {};
                  const userId = userJson?.userid || 'anonymous';
                  await qnaApi.addComment(detail!.id, { content: text, parentId: null }, { userId });
                  const serverComments = await qnaApi.getComments(detail!.id);
                  const mapped: LocalComment[] = serverComments.map(sc => ({
                    id: Number(sc.id),
                    parentId: sc.parentId ?? null,
                    content: sc.isDeleted ? '[삭제됨]' : sc.content,
                    author: sc.createdId || '익명',
                    createdAt: sc.createdAt ? new Date(sc.createdAt).toLocaleString() : '',
                  }));
                  setComments(mapped);
                  setNewComment('');
                }}
                disabled={!newComment.trim()}
              >등록</Button>
            </Box>
          </Box>
        </Box>
      )}
    </BaseDialog>
  );
};

export default QnaDetailDialog;


