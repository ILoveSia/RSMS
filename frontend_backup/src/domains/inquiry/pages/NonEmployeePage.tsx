/**
 * 미종사자 현황 페이지
 * 적부구조도 이력 점검의 미종사자 현황 관리 페이지
 */
import { PersonOff as PersonOffIcon } from '@mui/icons-material';
import { Box, Card, CardContent, Paper, Typography } from '@mui/material';
import React from 'react';

const NonEmployeePage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display='flex' alignItems='center' mb={2}>
          <PersonOffIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant='h4' component='h1'>
            미종사자 현황
          </Typography>
        </Box>
        <Typography variant='body1' color='text.secondary'>
          적부구조도 이력 점검의 미종사자 현황을 관리하는 페이지입니다.
        </Typography>
      </Paper>

      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            미종사자 현황 관리
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            이 페이지는 미종사자 현황 관리 기능을 제공합니다. 향후 미종사자 목록 조회, 상태 변경,
            상세 이력 등의 기능이 추가될 예정입니다.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NonEmployeePage;
