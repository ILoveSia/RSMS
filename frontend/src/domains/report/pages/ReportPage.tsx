import React from 'react';
import { Box } from '@mui/material';
import { DataGrid } from '@/shared/components/ui';
import ManagementButtonGroup from '@/shared/components/ui/button/ManagementButtonGroup';
import TitleSearch from '@/domains/admin/components/TitleSearch';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { Description as DescriptionIcon } from '@mui/icons-material';
import type { DataGridColumn } from '@/shared/types/common';
import { useGetCodeName } from '@/shared/utils/codeUtils';

interface ReportRow {
  id: number;
  year: number;
  quarter: string;
  bankCd: string;
  documentName: string;
}

const ReportPage: React.FC = () => {
  const getCodeName = useGetCodeName();
  // 임시 데이터
  const rows: ReportRow[] = [
    { id: 1, year: 2024, quarter: '1Q', bankCd: 'B01', documentName: '내부통제 보고서(1분기)' },
    { id: 2, year: 2024, quarter: '2Q', bankCd: 'B02', documentName: '내부통제 보고서(2분기)' },
    { id: 3, year: 2023, quarter: '4Q', bankCd: 'B01', documentName: '내부통제 보고서(4분기)' },
  ];

  // 검색 상태 및 필터링
  const [query, setQuery] = React.useState('');
  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => {
      const bankName = getCodeName('BANK_CD', r.bankCd || '');
      const fields = [
        String(r.year),
        r.quarter,
        r.bankCd,
        bankName,
        r.documentName,
      ];
      return fields.some(v => (v || '').toLowerCase().includes(q));
    });
  }, [rows, query, getCodeName]);

  const columns: DataGridColumn<ReportRow>[] = [
    { field: 'year', headerName: '연도', width: 100, align: 'center' },
    { field: 'quarter', headerName: '분기', width: 100, align: 'center' },
    {
      field: 'bankCd',
      headerName: '기관',
      width: 160,
      align: 'center',
      renderCell: ({ value }) => getCodeName('BANK_CD', String(value ?? '')),
    },
    { field: 'documentName', headerName: '문서명', width: 320 },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="제출 보고서 관리"
        description="임시 페이지입니다. 요구사항 확정 전까지 간단한 레이아웃과 버튼만 제공합니다."
        icon={<DescriptionIcon />}
        elevation={false}
      />
      <PageContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          py: 1,
        }}
      >
        <TitleSearch
          value={query}
          onChange={setQuery}
          onEnter={() => {}}
          right={
            <ManagementButtonGroup
              onRegister={() => {}}
              onDelete={() => {}}
              showRegister
              showDelete
              showEdit={false}
              showSave={false}
              showCancel={false}
              showRefresh={false}
              showExcelDownload={false}
              align="right"
            />
          }
        />
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <DataGrid
            data={filteredRows}
            columns={columns}
            height={520}
            checkboxSelection
            selectable
          />
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default ReportPage;


