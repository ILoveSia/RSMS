import React from 'react';
import { Forum as ForumIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';

interface CommunityPageProps {
  className?: string;
}

const CommunityPage: React.FC<CommunityPageProps> = () => {
  return (
    <PageContainer>
      <PageHeader
        title='[902] 커뮤니티'
        icon={<ForumIcon />}
        description='공지, Q&A, 자료 공유 등 커뮤니티 기능이 제공될 예정입니다.'
        elevation={false}
      />

      <PageContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box textAlign='center' sx={{ py: 8 }}>
          <Typography variant='h5' gutterBottom>
            커뮤니티 기능 준비 중입니다
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {'시스템 관리 > 커뮤니티 메뉴에서 공지, Q&A, 자료 공유 기능을 제공할 예정입니다.'}
          </Typography>
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default CommunityPage;


