import React from 'react';
import { Box, Typography, Divider, Stack, Button } from '@mui/material';

const ReportPage: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        제출 보고서 관리 (임시)
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        임시 페이지입니다. 요구사항 확정 전까지 간단한 레이아웃과 버튼만 제공합니다.
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained">신규 보고서</Button>
        <Button variant="outlined">검색</Button>
        <Button variant="text">내보내기</Button>
      </Stack>
      <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          여기에 제출 보고서 목록/조회/업로드 UI가 들어갑니다.
        </Typography>
      </Box>
    </Box>
  );
};

export default ReportPage;


