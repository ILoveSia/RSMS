/**
 * 문서 정보 카드 컴포넌트
 * 책무기술서 정보를 카드 형태로 표시합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 문서 정보 표시만 담당
 * - Open/Closed: 새로운 정보 항목 추가 시 확장 가능
 * - Liskov Substitution: React 컴포넌트 인터페이스 준수
 * - Interface Segregation: 문서 정보 표시 관련 기능만 제공
 * - Dependency Inversion: Material-UI 컴포넌트에 의존
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Avatar,
  Divider,
  Chip,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Attachment as AttachmentIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { ResponsibilityDocumentDto } from '../api/responsibilityDocumentApi';
import StatusChip from './StatusChip';

interface DocumentInfoCardProps {
  document: ResponsibilityDocumentDto;
  onView?: () => void;
  onEdit?: () => void;
  compact?: boolean;
  showActions?: boolean;
}

const DocumentInfoCard: React.FC<DocumentInfoCardProps> = ({
  document,
  onView,
  onEdit,
  compact = false,
  showActions = true,
}) => {
  // 만료 상태 확인
  const getExpiryStatus = () => {
    if (!document.isValid) {
      return { type: 'expired', label: '만료됨', color: 'error' };
    }
    if (document.isExpiring) {
      return { type: 'expiring', label: `${document.daysUntilExpiry}일 후 만료`, color: 'warning' };
    }
    return null;
  };

  const expiryStatus = getExpiryStatus();

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3" noWrap sx={{ mb: 1 }}>
              {document.documentTitle}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={document.positionName}
                size="small"
                color="primary"
                variant="outlined"
              />
              <StatusChip status={document.status as any} />
              {document.documentVersion && (
                <Chip
                  label={`v${document.documentVersion}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          
          {/* 액션 버튼 */}
          {showActions && (
            <Stack direction="row" spacing={0.5}>
              {onView && (
                <Tooltip title="상세보기">
                  <IconButton size="small" onClick={onView}>
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onEdit && (
                <Tooltip title="수정">
                  <IconButton size="small" onClick={onEdit}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          )}
        </Box>

        {/* 경고 상태 */}
        {expiryStatus && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<WarningIcon />}
              label={expiryStatus.label}
              color={expiryStatus.color as any}
              size="small"
              variant="outlined"
            />
          </Box>
        )}

        {!compact && (
          <>
            <Divider sx={{ my: 2 }} />
            
            {/* 작성자 정보 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                작성자
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24 }}>
                  {document.authorName?.charAt(0)}
                </Avatar>
                <Typography variant="body2">
                  {document.authorName}
                </Typography>
              </Box>
            </Box>

            {/* 날짜 정보 */}
            <Stack spacing={1} sx={{ mb: 2 }}>
              {document.effectiveDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    시행일: {document.effectiveDate}
                  </Typography>
                </Box>
              )}
              {document.expiryDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    만료일: {document.expiryDate}
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* 첨부파일 정보 */}
            {document.attachmentCount && document.attachmentCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachmentIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  첨부파일 {document.attachmentCount}개
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* 컴팩트 모드에서의 간단한 정보 */}
        {compact && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {document.authorName} | {document.effectiveDate}
            </Typography>
            {document.attachmentCount && document.attachmentCount > 0 && (
              <Badge badgeContent={document.attachmentCount} color="primary">
                <AttachmentIcon fontSize="small" color="action" />
              </Badge>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentInfoCard;