import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

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
    console.log('삭제할 ID:', selectionModel);
    const newRows = rows.filter((row) => !selectionModel.includes(row.id));
    setRows(newRows);
    // 선택 모델 초기화
    setSelectionModel([]); 
  };

  return (
    <Box sx={{ p: 4, height: 500, width: '100%' }}>
      <h1>DataGrid 테스트</h1>
      <Button 
        variant="contained" 
        color="error" 
        onClick={handleDelete}
        disabled={selectionModel.length === 0}
        sx={{ mb: 2 }}
      >
        선택 항목 삭제
      </Button>

      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection // 체크박스 활성화

        // 이 두 부분이 핵심입니다.
        //rowSelectionModel={selectionModel}
        onRowSelectionModelChange={(newSelectionModel) => {
          setSelectionModel(newSelectionModel);
        }}
      />
      <pre style={{ mt: 2, p: 1, border: '1px solid #ccc', background: '#f5f5f5' }}>
        선택된 ID: {JSON.stringify(selectionModel)}
      </pre>
    </Box>
  );
};

export default TestGrid;