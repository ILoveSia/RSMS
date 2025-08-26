import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Campaign as CampaignIcon } from '@mui/icons-material';
import { PushPin as PushPinIcon } from '@mui/icons-material';
 
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import DataGrid from '@/shared/components/ui/data-display/DataGrid';
import TitleSearch from '../components/TitleSearch';
import noticeApi, { type NoticeListResponseDto } from '../api/noticeApi';
import ManagementButtonGroup from '@/shared/components/ui/button/ManagementButtonGroup';
import NoticeDetailDialog from '../components/NoticeDetailDialog';
import NoticeCreateDialog from '../components/NoticeCreateDialog';
import CommonCodeSelect from '@/shared/components/ui/form/CommonCodeSelect';
import { useGetCodeName } from '@/shared/utils/codeUtils';
import { useApiWithNotification } from '@/shared/hooks/useApiWithNotification';

type NoticeRow = NoticeListResponseDto;

const NoticePage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [rowsRaw, setRowsRaw] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<NoticeRow | null>(null);
  const [category, setCategory] = useState<string>('ALL');
  const getCodeName = useGetCodeName();
  const { callApiWithNotification } = useApiWithNotification();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const page = await callApiWithNotification(
      () => noticeApi.getNoticeList({ page: 0, size: 200, sort: 'createdAt', direction: 'DESC' }),
      'custom'
    );
    
    if (page) {
      setRowsRaw(page.content || []);
    } else {
      setRowsRaw([]);
    }
    
    setLoading(false);
  }, [callApiWithNotification]);

  useEffect(() => { loadData(); }, [loadData]);

  const rows = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    
    // 카테고리 필터링 먼저 적용
    let filtered = rowsRaw;
    if (category && category !== 'ALL') {
      filtered = rowsRaw.filter(r => r.category === category);
    }
    
    // 키워드 필터링 적용
    if (k) {
      filtered = filtered.filter(r => (r.title || '').toLowerCase().includes(k));
    }
    
    // pinned 우선 정렬 (true 먼저), 그 다음 created_at 내림차순
    return [...filtered].sort((a, b) => {
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap; // pinned=true 우선
      const ad = a.created_at ? new Date(a.created_at as any).getTime() : 0;
      const bd = b.created_at ? new Date(b.created_at as any).getTime() : 0;
      return bd - ad;
    });
  }, [rowsRaw, keyword, category]);

  // 카테고리 코드명으로 변환된 행 데이터
  const rowsWithCategoryNames = useMemo(() => {
    return rows.map(row => ({
      ...row,
      categoryName: getCodeName('CATEGORY', row.category || '')
    }));
  }, [rows, getCodeName]);

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
          <TitleSearch value={keyword} onChange={setKeyword} 
          right={
          <>
            <CommonCodeSelect
              groupCode="CATEGORY"
              value={category}
              onChange={setCategory}
              includeAll={true}
              allLabel="전체 카테고리"
              sx={{ mr: 1 }}
            />
            <ManagementButtonGroup
              showRegister
              showRefresh
              showDelete={false}
              align='right'
              onRegister={() => setCreateOpen(true)}
              onRefresh={loadData}
            />
          </>
          }
        />

        <DataGrid<NoticeRow & { categoryName: string }>
          data={rowsWithCategoryNames}
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
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {row.pinned ? (
                    <PushPinIcon fontSize='small' style={{ color: '#ff8f00', marginRight: 6 }}  />
                  ) : null}
                  {/* 공개여부 필드 제거로 자물쇠 아이콘 표시 제거 */}
                  <span style={{ color: '#1976d2', cursor: 'default' }}>{row.title}</span>
                </span>
              ),
            },
            {
              field: 'created_at',
              headerName: '작성일',
              width: 140,
              align: 'center',
              valueFormatter: (params) => {
                const value = params.value;
                return value?.toString().split('T')[0]||'';
              }
            },
            { field: 'view_count', headerName: '조회수', width: 100, align: 'center' },
          ]}
          pagination={{
            page: 1,
            pageSize: 10,
            totalItems: rowsWithCategoryNames.length,
            totalPages: 1,
            onPageChange: () => {},
            onPageSizeChange: () => {},
          }}
          sortable
          // height={560}
          getRowClassName={({ row }) => (row.pinned ? 'row-pinned' : '')}
          disableRowSelectionOnClick
          rowSelectionModel={[]}
          sx={{
            '& .row-pinned': {
              backgroundColor: 'rgba(255, 193, 7, 0.14)',
            },
          }}
          onRowClick={async (row) => {
            const detail = await callApiWithNotification(
              () => noticeApi.getNoticeDetail(Number(row.id)),
              'custom'
            );
            
            if (detail) {
              setSelected(detail as any);
            } else {
              setSelected(row as any);
            }
            
            setDetailOpen(true);
          }}
        />

        {detailOpen && (
          <NoticeDetailDialog
            onClose={() => setDetailOpen(false)}
            data={selected}
          />
        )}

        {createOpen && (
          <NoticeCreateDialog
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            loading={creating}
            onSubmit={async (form) => {
              setCreating(true);
              const userRaw = localStorage.getItem('user');
              const userJson = userRaw ? JSON.parse(userRaw) : {};
              const userId = userJson?.userid || 'system';
              
              const result = await callApiWithNotification(
                () => noticeApi.createNotice(form, { userId }),
                'custom'
              );
              
              if (result) {
                setCreateOpen(false);
                await loadData();
              }
              
              setCreating(false);
            }}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default NoticePage;


