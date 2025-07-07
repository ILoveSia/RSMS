/**
 * 부서별 점검 현황 페이지
 * 적부구조도 이력 점검의 부서별 점검 현황 관리 페이지
 */
import { Business as BusinessIcon } from '@mui/icons-material';
import { Box, Card, CardContent, Paper, Typography } from '@mui/material';
import React from 'react';

const DeptStatusPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display='flex' alignItems='center' mb={2}>
          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant='h4' component='h1'>
            점검 현황(부서별)
          </Typography>
        </Box>
        <Typography variant='body1' color='text.secondary'>
          적부구조도 이력 점검의 부서별 점검 현황을 조회하는 페이지입니다.
        </Typography>
      </Paper>

      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            부서별 점검 현황 조회
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            이 페이지는 부서별 점검 현황 조회 기능을 제공합니다. 향후 부서별 통계, 점검 완료율, 상세
            점검 이력 등의 기능이 추가될 예정입니다.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeptStatusPage;
