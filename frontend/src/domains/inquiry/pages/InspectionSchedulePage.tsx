/**
 * 점검 계획 페이지
 * 적부구조도 이력 점검의 점검 계획 관리 페이지
 */
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { Box, Card, CardContent, Paper, Typography } from '@mui/material';
import React from 'react';

const InspectionSchedulePage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display='flex' alignItems='center' mb={2}>
          <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant='h4' component='h1'>
            점검 계획
          </Typography>
        </Box>
        <Typography variant='body1' color='text.secondary'>
          적부구조도 이력 점검의 점검 계획을 관리하는 페이지입니다.
        </Typography>
      </Paper>

      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            점검 계획 관리
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            이 페이지는 점검 계획 관리 기능을 제공합니다. 향후 점검 일정 등록, 수정, 삭제 등의
            기능이 추가될 예정입니다.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InspectionSchedulePage;
