import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ListAlt as ListAltIcon } from '@mui/icons-material';
// removed unused Box, Typography imports
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import DataGrid from '@/shared/components/ui/data-display/DataGrid';
import { ExcelDownloadButton, SearchButton, Button } from '@/shared/components/ui/button';
import { TextField, InputAdornment, Box } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import QnaDetailDialog from '../components/QnaDetailDialog';
import QnaCreateDialog from '../components/QnaCreateDialog';
import type { QnaListResponseDto } from '@/app/types/qna';
import type { GridSortModel } from '@mui/x-data-grid';
import qnaApi from '../api/qnaApi';

interface QnaPageProps {
  className?: string;
}

const QnaPage: React.FC<QnaPageProps> = () => {
  const [rows, setRows] = useState<QnaListResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1); // UI 1-based
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [keyword, setKeyword] = useState<string>('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createKey, setCreateKey] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const primarySort = sortModel[0];
      const sortField = primarySort?.field || 'createdAt';
      const sortDir = (primarySort?.sort || 'desc').toUpperCase() as 'ASC' | 'DESC';
      const resp = await qnaApi.getQnaList({
        page: page - 1,
        size: pageSize,
        sort: sortField,
        direction: sortDir,
        keyword: keyword || undefined,
      });
      setRows(resp.content || []);
      setTotalItems(resp.totalElements || 0);
      setTotalPages(resp.totalPages || 0);
    } catch (e: any) {
      setError(e?.message || 'Q&A 데이터를 불러오는데 실패했습니다.');
      setRows([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortModel, keyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pagination = useMemo(
    () => ({
      page,
      pageSize,
      totalItems,
      totalPages,
      onPageChange: (p: number) => setPage(p),
      onPageSizeChange: (ps: number) => setPageSize(ps),
    }),
    [page, pageSize, totalItems, totalPages]
  );

  return (
    <PageContainer>
      <PageHeader
        title='[903] Q&A'
        icon={<ListAltIcon />}
        description='질문과 답변을 관리하는 화면입니다.'
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
        <Box sx={{
          display: 'flex',
          gap: 1,
          mb: 2,
          alignItems: 'center',
          backgroundColor: 'var(--bank-bg-secondary)',
          border: '1px solid var(--bank-border)',
          px: 2,
          py: 1,
          borderRadius: '4px',
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>제목</span>
          <TextField
            size="small"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="제목 입력"
            sx={{ minWidth: 220, maxWidth: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); loadData(); } }}
          />
          <SearchButton
            onClick={() => { setPage(1); loadData(); }}
            loading={loading}
            disabled={loading}
          />
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <ExcelDownloadButton
              onDownload={async () => { /* TODO: export hook up if needed */ }}
              filename="qna_list"
              disabled={loading}
              loading={loading}
            />
            <Button size="small" onClick={() => { setCreateKey(k => k + 1); setCreateOpen(true); }}>
              등록
            </Button>
          </Box>
        </Box>

        <DataGrid<QnaListResponseDto>
          data={rows}
          loading={loading}
          error={error}
          columns={[
            { field: 'category', headerName: '카테고리', width: 140 },
            {
              field: 'title',
              headerName: '제목',
              flex: 1,
              minWidth: 280,
              renderCell: ({ row }) => (
                <span
                  style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => { setSelectedId(Number(row.id)); setDetailOpen(true); }}
                >
                  {row.title}
                </span>
              ),
            },
            { field: 'questionerName', headerName: '작성자', width: 120 },
            { field: 'createdAtFormatted', headerName: '작성일', width: 140 },
            { field: 'statusDescription', headerName: '상태', width: 120 },
            { field: 'priorityDescription', headerName: '우선순위', width: 120 },
            { field: 'viewCount', headerName: '조회수', width: 100 },
          ]}
          pagination={pagination}
          serverSide
          sortable
          onSortChange={model => setSortModel(model)}
          onRowDoubleClick={undefined}
          height={600}
        />
        <QnaDetailDialog open={detailOpen} qnaId={selectedId ?? undefined} onClose={() => setDetailOpen(false)} />

        {createOpen && (
          <QnaCreateDialog
            key={createKey}
            open={true}
            onClose={() => setCreateOpen(false)}
            loading={creating}
            onSubmit={async (form) => {
              try {
                setCreating(true);
                const userRaw = localStorage.getItem('user');
                const userJson = userRaw ? JSON.parse(userRaw) : {};
                const userId = userJson?.userid || 'anonymous';
                const userName = userJson?.username || '익명';
                await qnaApi.createQna(form, { userId, userName });
                setCreateOpen(false);
                setPage(1);
                await loadData();
              } finally {
                setCreating(false);
              }
            }}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default QnaPage;


