import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Button } from '@/shared/components/ui/button';
import { CommentInput } from '@/shared/components/ui/form';

export interface LocalComment {
  id: number;
  parentId: number | null;
  content: string;
  author: string;
  createdAt: string;
}

export interface CommentItemProps {
  comment: LocalComment;
  allComments: LocalComment[];
  depth?: number;
  parentEffectiveDepth?: number;
  onRegisterReply: (parentId: number, content: string) => Promise<void> | void;
  loading?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  allComments,
  depth = 0,
  parentEffectiveDepth = 0,
  onRegisterReply,
  loading = false,
}) => {
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [replyContent, setReplyContent] = useState<string>('');

  const children = allComments.filter(c => c.parentId === comment.id);
  const effectiveDepth = Math.min(depth, 3); // 4단계부터는 동일 들여쓰기 유지
  const deltaDepth = Math.max(0, effectiveDepth - parentEffectiveDepth);

  return (
    <Box sx={{ ml: deltaDepth * 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2">{comment.author}</Typography>
        <Typography variant="caption" color="text.secondary">{comment.createdAt}</Typography>
      </Box>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{comment.content}</Typography>
      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
        <Button size="small" variant="text" onClick={() => { setIsReplying(true); setReplyContent(''); }}>답글</Button>
      </Box>
      {isReplying && (
        <Box sx={{ mt: 1 }}>
          <CommentInput
            value={replyContent}
            onChange={setReplyContent}
            onSubmit={async () => {
              const text = replyContent.trim();
              if (!text) return;
              await onRegisterReply(comment.id, text);
              setIsReplying(false);
              setReplyContent('');
            }}
            onCancel={() => { setIsReplying(false); setReplyContent(''); }}
            loading={loading}
            label="답글"
            placeholder="답글을 입력하세요"
            minRows={3}
            size="small"
            registerLabel="등록"
            cancelLabel="취소"
          />
        </Box>
      )}

      {/* Children */}
      {children.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {children.map(child => (
            <CommentItem
              key={child.id}
              comment={child}
              allComments={allComments}
              depth={depth + 1}
              parentEffectiveDepth={effectiveDepth}
              onRegisterReply={onRegisterReply}
              loading={loading}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentItem;


