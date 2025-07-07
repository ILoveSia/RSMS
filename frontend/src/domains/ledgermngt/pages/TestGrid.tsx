import { Box, Button, Paper, Typography } from '@mui/material';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import React, { useState } from 'react';

// 1. 테스트용 컬럼 정의
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'role', headerName: 'Role', width: 150 },
];

// 2. 테스트용 데이터 정의
const initialRows = [
  { id: 1, name: 'Alice', role: 'Developer' },
  { id: 2, name: 'Bob', role: 'Designer' },
  { id: 3, name: 'Charlie', role: 'Manager' },
  { id: 4, name: 'David', role: 'Tester' },
  { id: 5, name: 'Eve', role: 'Developer' },
];

const TestGrid = (): React.JSX.Element => {
  // 3. 행 데이터와 선택 모델을 위한 상태
  const [rows, setRows] = useState(initialRows);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  // 4. 삭제 핸들러
  const handleDelete = () => {
    if (selectionModel.length === 0) {
      alert('삭제할 항목을 선택하세요.');
      return;
    }

    const newRows = rows.filter(row => !selectionModel.includes(row.id));
    setRows(newRows);
    // 선택 모델 초기화
    setSelectionModel([]);
  };

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Paper sx={{ p: 3, width: '100%' }}>
        <Typography variant='h4' gutterBottom>
          DataGrid 테스트
        </Typography>

        <Button
          variant='contained'
          color='error'
          onClick={handleDelete}
          disabled={selectionModel.length === 0}
          sx={{ mb: 3 }}
        >
          선택 항목 삭제 ({selectionModel.length})
        </Button>

        {/* 가장 간단한 방법: autoHeight 사용 */}
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          autoHeight
          onRowSelectionModelChange={newSelectionModel => {
            setSelectionModel(newSelectionModel);
          }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          sx={{
            width: '100%',
            border: 1,
            borderColor: 'divider',
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
        />

        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            선택된 ID: {JSON.stringify(selectionModel)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TestGrid;
