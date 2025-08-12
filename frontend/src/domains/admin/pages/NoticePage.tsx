import React, { useMemo, useState } from 'react';
import { Campaign as CampaignIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import DataGrid from '@/shared/components/ui/data-display/DataGrid';
import TitleSearch from '../components/TitleSearch';

type NoticeRow = {
  id: number;
  title: string;
  category?: string;
  isPublic: boolean;
  pinned?: boolean;
  viewCount: number;
  createdAt?: string;
};

const initialMock: NoticeRow[] = [
  {
    id: 1,
    title: '시스템 점검 안내 (10/15 22:00~24:00)',
    category: '시스템',
    isPublic: true,
    pinned: true,
    viewCount: 142,
    createdAt: '2025-10-10 09:00',
  },
  {
    id: 2,
    title: '개인정보 처리방침 개정 안내',
    category: '정책',
    isPublic: true,
    pinned: false,
    viewCount: 87,
    createdAt: '2025-10-08 14:20',
  },
  {
    id: 3,
    title: '추석 연휴 근무 안내',
    category: '일반',
    isPublic: true,
    pinned: false,
    viewCount: 201,
    createdAt: '2025-09-05 11:30',
  },
];

const NoticePage: React.FC = () => {
  const [keyword, setKeyword] = useState('');

  const rows = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return initialMock;
    return initialMock.filter(r => (r.title || '').toLowerCase().includes(k));
  }, [keyword]);

  return (
    <PageContainer>
      <PageHeader
        title='[901] 공지사항'
        icon={<CampaignIcon />}
        description='시스템 공지 및 안내를 조회합니다.'
        elevation={false}
      />

      <PageContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
          py: 1,
        }}
      >
        <TitleSearch value={keyword} onChange={setKeyword} />

        <DataGrid<NoticeRow>
          data={rows}
          loading={false}
          error={null}
          columns={[
            { field: 'category', headerName: '카테고리', width: 140, align: 'center' },
            {
              field: 'title',
              headerName: '제목',
              flex: 1,
              minWidth: 280,
              renderCell: ({ row }) => (
                <span style={{ color: '#1976d2', cursor: 'default' }}>{row.title}</span>
              ),
            },
            {
              field: 'pinned',
              headerName: '중요',
              width: 100,
              align: 'center',
              renderCell: ({ row }) =>
                row.pinned ? <Chip size='small' color='warning' label='상단고정' /> : null,
            },
            { field: 'createdAt', headerName: '작성일', width: 140, align: 'center' },
            { field: 'viewCount', headerName: '조회수', width: 100, align: 'center' },
          ]}
          pagination={{
            page: 1,
            pageSize: 10,
            totalItems: rows.length,
            totalPages: 1,
            onPageChange: () => {},
            onPageSizeChange: () => {},
          }}
          serverSide={false}
          sortable
          height={560}
        />
      </PageContent>
    </PageContainer>
  );
};

export default NoticePage;


