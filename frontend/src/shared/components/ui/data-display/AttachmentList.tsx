import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
} from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import type { AttachmentInfo } from '@/domains/common/api/attachmentApi';

interface AttachmentListProps {
  attachments: AttachmentInfo[];
  mode: 'create' | 'edit' | 'view' | 'register';
  onDownload: (file: AttachmentInfo) => void;
  onDelete: (id: number) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  mode,
  onDownload,
  onDelete,
}) => {
  if (attachments.length === 0) return null;

  // 'register' 모드에서는 액션 버튼을 표시하지 않음
  const showActions = mode !== 'register';

  return (
    <Box>
      <Typography sx={{ mb: 1, fontSize: '0.8rem', color: '#666' }}>
        첨부파일 목록
      </Typography>
      <List dense>
        {attachments.map((f) => (
          <ListItem
            key={f.attachId}
            sx={{
              px: 0,
              py: 0.5,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              mb: 0.5,
            }}
          >
            <ListItemText
              primary={f.originalFilename}
              secondary={`${(f.fileSize / 1024).toFixed(1)} KB • ${new Date(
                f.createdAt
              ).toLocaleDateString()}`}
              primaryTypographyProps={{ fontSize: '0.8rem' }}
              secondaryTypographyProps={{ fontSize: '0.7rem' }}
            />
            {showActions && (
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  onClick={() => onDownload(f)}
                  title="다운로드"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
                {mode !== 'view' && (
                  <IconButton
                    size="small"
                    onClick={() => onDelete(f.attachId)}
                    title="삭제"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AttachmentList;