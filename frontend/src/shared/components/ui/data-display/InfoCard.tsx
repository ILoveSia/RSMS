import type { Theme } from '@mui/material';
import { Box } from '@mui/material';
import type { SystemProps } from '@mui/system';
import React from 'react';

export interface InfoCardProps {
  /**
   * 카드 제목
   */
  title: string;
  // icon: React.ReactNode;
  /**
   * 카드 내용 제목
   */
  contentTitle?: string;

  /**
   * 카드 내용 설명
   */
  contentDescription?: string;

  /**
   * 카드 클릭 핸들러
   */
  onClick?: () => void;

  /**
   * 추가 스타일
   */
  sx?: SystemProps<Theme>;

  /**
   * 콘텐츠의 이미지 영역
   */
  contentImage?: React.ReactNode;
}

/**
 * 정보 표시를 위한 카드 컴포넌트
 * 책무구조도 스타일의 카드 컴포넌트로,
 * 헤더에 제목과 화살표 아이콘이 있고,
 * 콘텐츠 영역에 이미지와 텍스트를 나란히 배치할 수 있습니다.
 */
export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  contentTitle,
  contentDescription,
  onClick,
  sx,
  contentImage,
}) => {
  return (
    <Box
      className="info-card"
      onClick={onClick}
      sx={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        width: '100%',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
        } : {},
        '& .document-stack': {
          position: 'relative',
          width: '80px',
          height: '100px',
          '& .document-page': {
            position: 'absolute',
            width: '60px',
            height: '80px',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '3px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            '&:nth-of-type(1)': {
              transform: 'rotate(-5deg)',
              zIndex: 1,
            },
            '&:nth-of-type(2)': {
              transform: 'rotate(3deg)',
              zIndex: 2,
            },
            '&:nth-of-type(3)': {
              transform: 'rotate(-2deg)',
              zIndex: 3,
            },
          },
        },
        ...sx
      }}
    >
      {/* 헤더 영역 */}
      <Box
        className="info-card__header"
        sx={{
          height: '45px',
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          backgroundColor: '#e2e8f0',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '8px 8px 0 0',
        }}
      >
        {onClick && (
          <Box
            className="info-card__arrow"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              marginRight: '8px',
              '&:hover': {
                backgroundColor: '#059669',
              },
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="white"
              style={{ width: '16px', height: '16px' }}
            >
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </Box>
        )}
        <Box
          component="h3"
          className="info-card__title"
          sx={{
            margin: 0,
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'rgba(0, 0, 0, 0.87)',
          }}
        >
          {title}
        </Box>
      </Box>

      {/* 콘텐츠 영역 */}
      <Box
        className="info-card__content"
        sx={{
          padding: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 3,
          fontSize: '0.8rem',
        }}
      >
        {contentImage && (
          <Box
            className="info-card__image"
            sx={{ flex: '0 0 auto' }}
          >
            {contentImage}
          </Box>
        )}
        {(contentTitle || contentDescription) && (
          <Box
            className="info-card__text"
            sx={{ flex: 1 }}
          >
            {contentTitle && (
              <Box
                component="h4"
                sx={{
                  margin: '0 0 8px 0',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {contentTitle}
              </Box>
            )}
            {contentDescription && (
              <Box
                component="div"
                sx={{
                  lineHeight: 1.5,
                  color: 'rgba(0, 0, 0, 0.7)',
                  whiteSpace: 'pre-line',
                }}
              >
                {contentDescription}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InfoCard;
