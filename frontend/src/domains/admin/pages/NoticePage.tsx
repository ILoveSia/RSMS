import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Campaign as CampaignIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import DataGrid from '@/shared/components/ui/data-display/DataGrid';
import TitleSearch from '../components/TitleSearch';
import noticeApi, { type NoticeListResponseDto } from '../api/noticeApi';

type NoticeRow = NoticeListResponseDto;

const NoticePage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [rowsRaw, setRowsRaw] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const page = await noticeApi.getNoticeList({ page: 0, size: 200, sort: 'createdAt', direction: 'DESC', onlyPublic: true });
      setRowsRaw(page.content || []);
      console.log(page.content);
    } catch (e: any) {
      setError(e?.message || '공지사항 데이터를 불러오는데 실패했습니다.');
      setRowsRaw([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const rows = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return rowsRaw;
    return rowsRaw.filter(r => (r.title || '').toLowerCase().includes(k));
  }, [rowsRaw, keyword]);

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
        <TitleSearch value={keyword} onChange={setKeyword} onEnter={() => { /* no-op, client filter */ }} />

        <DataGrid<NoticeRow>
          data={rows}
          loading={loading}
          error={error}
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
            { field: 'created_at', headerName: '작성일', width: 140, align: 'center' },
            { field: 'view_count', headerName: '조회수', width: 100, align: 'center' },
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


