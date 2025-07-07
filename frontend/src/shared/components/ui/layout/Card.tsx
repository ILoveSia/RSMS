import React, { forwardRef } from 'react';
import {
  Card as MuiCard,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Avatar,
  IconButton,
  Box,
  Skeleton,
  useTheme
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { CardProps } from './types';

/**
 * Card 컴포넌트
 *
 * Material-UI Card를 기반으로 한 카드 컴포넌트
 * 헤더, 미디어, 컨텐츠, 액션 등을 제공
 *
 * @example
 * ```tsx
 * // 기본 카드
 * <Card title="제목" subtitle="부제목">
 *   <Typography>카드 내용</Typography>
 * </Card>
 *
 * // 미디어가 있는 카드
 * <Card
 *   title="이미지 카드"
 *   media={{ image: '/image.jpg', alt: '이미지', height: 200 }}
 *   actions={<Button>더보기</Button>}
 * >
 *   <Typography>내용</Typography>
 * </Card>
 *
 * // 클릭 가능한 카드
 * <Card
 *   title="클릭 카드"
 *   clickable
 *   onClick={handleClick}
 *   hoverable
 * >
 *   <Typography>클릭해보세요</Typography>
 * </Card>
 * ```
 */
const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'elevation',
  elevation = 1,
  square = false,
  raised = false,
  header,
  title,
  subtitle,
  media,
  actions,
  children,
  footer,
  loading = false,
  hoverable = false,
  clickable = false,
  onClick,
  className,
  sx,
  ...props
}, ref) => {
  const theme = useTheme();

  // 호버 및 클릭 스타일
  const getCardSx = () => {
    let cardSx = sx || {};

    if (hoverable || clickable) {
      cardSx = {
        ...cardSx,
        transition: theme.transitions.create(['box-shadow', 'transform'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          boxShadow: theme.shadows[raised ? 8 : 4],
          ...(hoverable && {
            transform: 'translateY(-2px)',
          }),
        },
      };
    }

    if (clickable) {
      cardSx = {
        ...cardSx,
        cursor: 'pointer',
        '&:active': {
          transform: 'scale(0.98)',
        },
      };
    }

    return cardSx;
  };

  // 로딩 상태 렌더링
  const renderLoading = () => (
    <Box p={2}>
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={120} />
    </Box>
  );

  // 헤더 렌더링
  const renderHeader = () => {
    if (header) {
      return header;
    }

    if (title || subtitle) {
      return (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
        />
      );
    }

    return null;
  };

  // 미디어 렌더링
  const renderMedia = () => {
    if (!media) return null;

    return (
      <CardMedia
        component={media.component || 'img'}
        height={media.height || 200}
        image={media.image}
        alt={media.alt || ''}
      />
    );
  };

  // 컨텐츠 렌더링
  const renderContent = () => {
    if (loading) {
      return renderLoading();
    }

    if (!children) return null;

    return (
      <CardContent>
        {children}
      </CardContent>
    );
  };

  // 액션 렌더링
  const renderActions = () => {
    if (!actions) return null;

    return (
      <CardActions>
        {actions}
      </CardActions>
    );
  };

  // 푸터 렌더링
  const renderFooter = () => {
    if (!footer) return null;

    return (
      <Box p={2} pt={0}>
        {footer}
      </Box>
    );
  };

  return (
    <MuiCard
      ref={ref}
      variant={variant}
      elevation={raised ? 8 : elevation}
      square={square}
      className={className}
      sx={getCardSx()}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {renderHeader()}
      {renderMedia()}
      {renderContent()}
      {renderActions()}
      {renderFooter()}
    </MuiCard>
  );
});

Card.displayName = 'Card';

export default Card;
