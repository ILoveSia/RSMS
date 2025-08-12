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
  const [allRows, setAllRows] = useState<QnaListResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1); // UI 1-based
  const [pageSize, setPageSize] = useState<number>(10);
  // 클라이언트 페이지네이션으로 전환됨: 총계는 sortedRows.length로 계산
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [keyword, setKeyword] = useState<string>('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);
  const [createKey, setCreateKey] = useState(0);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchSize = 200; // 초기 일괄 로드 페이지 크기
      const primarySort = sortModel[0];
      const sortField = (primarySort?.field as string) || 'createdAt';
      const sortDir = (primarySort?.sort || 'desc').toUpperCase() as 'ASC' | 'DESC';

      const first = await qnaApi.getQnaList({ page: 0, size: fetchSize, sort: sortField, direction: sortDir });
      let items = first.content || [];
      const total = first.totalPages || 1;
      for (let p = 1; p < total; p++) {
        // eslint-disable-next-line no-await-in-loop
        const resp = await qnaApi.getQnaList({ page: p, size: fetchSize, sort: sortField, direction: sortDir });
        items = items.concat(resp.content || []);
      }
      setAllRows(items);
    } catch (e: any) {
      setError(e?.message || 'Q&A 데이터를 불러오는데 실패했습니다.');
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  }, [sortModel]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // 키워드 필터링 (제목 기준)
  const filteredRows = useMemo(() => {
    const k = keyword.trim();
    if (!k) return allRows;
    const lower = k.toLowerCase();
    return allRows.filter(r => (r.title || '').toLowerCase().includes(lower));
  }, [allRows, keyword]);

  // 정렬 (primary sort만 적용)
  const sortedRows = useMemo(() => {
    const primary = sortModel[0];
    if (!primary) return filteredRows;
    const { field, sort } = primary;
    const dir = sort === 'asc' ? 1 : -1;
    const sorted = [...filteredRows].sort((a: any, b: any) => {
      const va = a?.[field as keyof typeof a];
      const vb = b?.[field as keyof typeof b];
      if (va == null && vb == null) return 0;
      if (va == null) return -1 * dir;
      if (vb == null) return 1 * dir;
      // 숫자 비교
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      // 날짜/문자 비교 (ISO 문자열 포함)
      const sa = String(va);
      const sb = String(vb);
      return sa.localeCompare(sb) * dir;
    });
    return sorted;
  }, [filteredRows, sortModel]);

  // 페이지네이션 계산 (클라이언트 사이드)
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return sortedRows.slice(start, end);
  }, [sortedRows, page, pageSize]);

  const pagination = useMemo(
    () => ({
      page,
      pageSize,
      totalItems: sortedRows.length,
      totalPages: Math.max(1, Math.ceil(sortedRows.length / pageSize)),
      onPageChange: (p: number) => setPage(p),
      onPageSizeChange: (ps: number) => setPageSize(ps),
    }),
    [page, pageSize, sortedRows]
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
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); } }}
          />
          <SearchButton
            onClick={() => { setPage(1); }}
            loading={loading}
            disabled={loading}
          />
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            {selectedIds.length > 0 && (
              <Button
                size="small"
                color="error"
                onClick={async () => {
                  // 간단 확인 (Confirm 컴포넌트 연결 가능)
                  const ok = window.confirm(`${selectedIds.length}건 삭제하시겠습니까?`);
                  if (!ok) return;
                  try {
                    setLoading(true);
                    const userRaw = localStorage.getItem('user');
                    const userJson = userRaw ? JSON.parse(userRaw) : {};
                    const userId = userJson?.userid || 'anonymous';
                    const userName = userJson?.username || '익명';
                    await qnaApi.deleteQnaBulk(selectedIds, { userId, userName });
                    setSelectedIds([]);
                    await loadAllData();
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                선택삭제
              </Button>
            )}
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
          data={pagedRows}
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
                <span
                  style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => { setSelectedId(Number(row.id)); setDetailOpen(true); }}
                >
                  {row.title}
                </span>
              ),
            },
            { field: 'questionerName', headerName: '작성자', width: 120, align: 'center' },
            { field: 'createdAtFormatted', headerName: '작성일', width: 140, align: 'center' },
            { field: 'statusDescription', headerName: '상태', width: 120, align: 'center' },
            { field: 'priorityDescription', headerName: '우선순위', width: 120, align: 'center' },
            { field: 'viewCount', headerName: '조회수', width: 100, align: 'center' },
          ]}
          pagination={pagination}
          serverSide={false}
          sortable
          onSortChange={model => { setSortModel(model); setPage(1); }}
          onRowDoubleClick={undefined}
          height={600}
          checkboxSelection
          onRowSelectionChange={(_, selected) => {
            // keys는 DataGrid 내부 _gridId, selected는 row 데이터 배열
            const ids = selected.map(r => Number(r.id)).filter(n => !Number.isNaN(n));
            setSelectedIds(ids);
          }}
        />
        <QnaDetailDialog
          open={detailOpen}
          qnaId={selectedId ?? undefined}
          onClose={() => setDetailOpen(false)}
          onSaved={async () => {
            await loadAllData();
          }}
        />

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
                 await loadAllData();
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


