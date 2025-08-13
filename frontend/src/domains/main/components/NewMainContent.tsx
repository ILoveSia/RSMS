/**
 * 새로운 메인 콘텐츠 컴포넌트
 * 업무 중심의 개인화된 대시보드
 */
import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Fade,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountTree as WorkflowIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import WorkDashboard from './WorkDashboard';
import WorkflowVisualization from './WorkflowVisualization';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`main-tabpanel-${index}`}
      aria-labelledby={`main-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in timeout={300}>
          <Box>{children}</Box>
        </Fade>
      )}
    </div>
  );
};

const NewMainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <PageContainer
      sx={{
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <PageContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
          p: 0,
        }}
      >
        {/* 탭 네비게이션 */}
        <Paper 
          sx={{ 
            borderRadius: 0,
            borderBottom: '1px solid var(--bank-border)',
            backgroundColor: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="main dashboard tabs"
            sx={{
              px: 2,
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                py: 0.5,
                '&.Mui-selected': {
                  color: '#1976d2',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1976d2',
                height: 2,
              },
            }}
          >
            <Tab
              icon={<DashboardIcon fontSize="small" />}
              iconPosition="start"
              label="업무 대시보드"
              sx={{ gap: 0.5 }}
            />
            <Tab
              icon={<WorkflowIcon fontSize="small" />}
              iconPosition="start"
              label="워크플로우"
              sx={{ gap: 0.5 }}
            />
            <Tab
              icon={<AnalyticsIcon fontSize="small" />}
              iconPosition="start"
              label="분석 & 리포트"
              sx={{ gap: 0.5 }}
            />
          </Tabs>
        </Paper>

        {/* 탭 콘텐츠 */}
        <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: '#f8fafc' }}>
          <TabPanel value={activeTab} index={0}>
            <WorkDashboard />
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <WorkflowVisualization />
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
                분석 & 리포트
              </Typography>
              <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid var(--bank-border)' }}>
                <AnalyticsIcon sx={{ fontSize: 64, color: '#9e9e9e', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  분석 기능 개발 예정
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  업무 성과 분석, 트렌드 리포트, KPI 대시보드 등의 기능이 추가될 예정입니다.
                </Typography>
              </Paper>
            </Box>
          </TabPanel>
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default NewMainContent;