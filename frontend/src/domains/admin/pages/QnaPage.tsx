import type { QnaListResponseDto } from '@/app/types/qna';
import { QnaStatus } from '@/app/types/qna';
import { Button } from '@/shared/components/ui/button';
import ManagementButtonGroup from '@/shared/components/ui/button/ManagementButtonGroup';
import DataGrid from '@/shared/components/ui/data-display/DataGrid';
import { useToastHelpers } from '@/shared/components/ui/feedback/ToastProvider';
import CommonCodeSelect from '@/shared/components/ui/form/CommonCodeSelect';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { useGetCodeName } from '@/shared/utils/codeUtils';
import { ListAlt as ListAltIcon } from '@mui/icons-material';
import type { GridSortModel } from '@mui/x-data-grid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import qnaApi from '../api/qnaApi';
import QnaCreateDialog from '../components/QnaCreateDialog';
import QnaDetailDialog from '../components/QnaDetailDialog';
import TitleSearch from '../components/TitleSearch';

interface QnaPageProps {
  className?: string;
}

const QnaPage: React.FC<QnaPageProps> = () => {
  const [allRows, setAllRows] = useState<QnaListResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1); // UI 1-based
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [keyword, setKeyword] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);
  const [category, setCategory] = useState<string>('ALL');
  const { showError } = useToastHelpers();
  const getCodeName = useGetCodeName();

  // Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [createOpen, setCreateOpen] = useState(false);
  
  const openDetailDialog = useCallback((_mode: string, id: number) => {
    setSelectedId(id);
    setDetailOpen(true);
  }, []);
  
  const closeDetailDialog = useCallback(() => {
    setDetailOpen(false);
    setSelectedId(undefined);
  }, []);
  
  const openCreateDialog = useCallback(() => {
    setCreateOpen(true);
  }, []);
  
  const closeCreateDialog = useCallback(() => {
    setCreateOpen(false);
  }, []);

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
    // 카테고리 필터링 먼저 적용
    let result = allRows;
    if (category && category !== 'ALL') {
      result = allRows.filter(r => r.category === category);
    }
    
    // 키워드 필터링 (제목 기준)
    const k = keyword.trim();
    if (!k) return result;
    const lower = k.toLowerCase();
    return result.filter(r => (r.title || '').toLowerCase().includes(lower));
  }, [allRows, keyword, category]);

  // 카테고리 코드명으로 변환된 행 데이터
  const rowsWithCategoryNames = useMemo(() => {
    return filteredRows.map(row => ({
      ...row,
      categoryName: getCodeName('CATEGORY', row.category || '')
    }));
  }, [filteredRows, getCodeName]);

  // 정렬 (primary sort만 적용)
  const sortedRows = useMemo(() => {
    const primary = sortModel[0];
    if (!primary) return rowsWithCategoryNames;
    const { field, sort } = primary;
    const dir = sort === 'asc' ? 1 : -1;
    const sorted = [...rowsWithCategoryNames].sort((a: any, b: any) => {
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
  }, [rowsWithCategoryNames, sortModel]);

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
        <TitleSearch
          value={keyword}
          onChange={(v) => setKeyword(v)}
          onEnter={() => setPage(1)}
          right={
            <>
              <CommonCodeSelect
                groupCode="CATEGORY"
                value={category}
                onChange={(v) => setCategory(v)}
                includeAll={true}
                allLabel="전체 카테고리"
                sx={{ mr: 1 }}
              />
              {selectedIds.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  onClick={async () => {
                    const ok = window.confirm(`${selectedIds.length}건 삭제하시겠습니까?`);
                    if (!ok) return;
                    try {
                      setLoading(true);
                      const userRaw = localStorage.getItem('user');
                      const userJson = userRaw ? JSON.parse(userRaw) : {};
                      const userId = userJson?.userid || 'anonymous';
                      const userName = userJson?.username || '익명';
                      const blocked = allRows.filter(r => selectedIds.includes(Number(r.id)) && (r.status === QnaStatus.ANSWERED || r.status === QnaStatus.CLOSED));
                      if (blocked.length > 0) {
                        showError('답변완료 또는 종료된 항목은 삭제할 수 없습니다. 선택에서 제외해 주세요.');
                        return;
                      }
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
              <ManagementButtonGroup
                onRefresh={async () => { setPage(1); await loadAllData(); }}
                onRegister={openCreateDialog}
                onExcelDownload={async () => { /* TODO: export hook up if needed */ }}
                filename="qna_list"
              />
            </>
          }
        />

        <DataGrid<QnaListResponseDto & { categoryName: string }>
          data={pagedRows}
          loading={loading}
          error={error}
          columns={[
            { field: 'categoryName', headerName: '카테고리', width: 140, align: 'center' },
            {
              field: 'title',
              headerName: '제목',
              flex: 1,
              minWidth: 280,
              renderCell: ({ row }) => (
                <span
                  style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                  onMouseDown={(e) => { e.stopPropagation(); }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openDetailDialog('view', Number(row.id));
                  }}
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
          onClose={closeDetailDialog}
          onSaved={async () => {
            await loadAllData();
          }}
        />

        {createOpen && (
          <QnaCreateDialog
            open={createOpen}
            onClose={closeCreateDialog}
            loading={creating}
            onSubmit={async (form) => {
              try {
                setCreating(true);
                const userRaw = localStorage.getItem('user');
                const userJson = userRaw ? JSON.parse(userRaw) : {};
                const userId = userJson?.userid || 'anonymous';
                const userName = userJson?.username || '익명';
                await qnaApi.createQna(form, { userId, userName });
                closeCreateDialog();
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


