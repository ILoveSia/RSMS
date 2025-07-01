/**
 * 검토계획 페이지 컴포넌트
 * 컴플라이언스 검토 계획 관리
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileDownload as DownloadIcon,
} from '@mui/icons-material';
import type { IComponent } from '@/app/types';
import MainLayout from '../../../shared/components/layout/MainLayout';

interface IReviewPlanPageProps {
  // 빈 인터페이스 - 향후 props 추가 시 사용
}

interface ReviewPlan {
  id: string;
  title: string; // 검토계획명
  category: string; // 분류 (법령, 내부규정, 계약서 등)
  status: string; // 상태 (계획, 진행중, 완료, 지연)
  reviewer: string; // 검토자
  startDate: string; // 시작일
  endDate: string; // 완료예정일
  progress: number; // 진행률 (%)
  description: string; // 설명
}

const ReviewPlanPage: IComponent<IReviewPlanPageProps> = (): React.JSX.Element => {
  const [reviewPlans, setReviewPlans] = useState<ReviewPlan[]>([
    {
      id: '1',
      title: '개인정보보호법 준수 검토',
      category: '법령',
      status: '진행중',
      reviewer: '김법무',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      progress: 65,
      description: '개인정보보호법 개정사항에 따른 사내 규정 및 프로세스 검토'
    },
    {
      id: '2',
      title: '계약서 표준양식 개정',
      category: '계약서',
      status: '계획',
      reviewer: '이계약',
      startDate: '2024-02-01',
      endDate: '2024-03-01',
      progress: 0,
      description: '표준 계약서 양식의 법적 리스크 검토 및 개정'
    },
    {
      id: '3',
      title: '내부통제 규정 정비',
      category: '내부규정',
      status: '완료',
      reviewer: '박통제',
      startDate: '2023-12-01',
      endDate: '2024-01-10',
      progress: 100,
      description: '내부통제시스템 운영 규정 전면 개정'
    },
    {
      id: '4',
      title: 'ESG 경영 가이드라인 수립',
      category: '내부규정',
      status: '지연',
      reviewer: '최ESG',
      startDate: '2023-11-15',
      endDate: '2024-01-15',
      progress: 30,
      description: 'ESG 경영 실행을 위한 가이드라인 및 체크리스트 개발'
    },
    {
      id: '5',
      title: '공정거래법 준수 매뉴얼',
      category: '법령',
      status: '진행중',
      reviewer: '정공정',
      startDate: '2024-01-20',
      endDate: '2024-03-20',
      progress: 45,
      description: '공정거래법 준수를 위한 실무 매뉴얼 작성'
    }
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('전체');
  const [filterStatus, setFilterStatus] = useState<string>('전체');
  const [searchText, setSearchText] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<ReviewPlan | null>(null);

  // 필터링된 검토계획 목록
  const filteredPlans = reviewPlans.filter(plan => {
    const matchesCategory = filterCategory === '전체' || plan.category === filterCategory;
    const matchesStatus = filterStatus === '전체' || plan.status === filterStatus;
    const matchesSearch = plan.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         plan.reviewer.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // 상태별 색상 매핑
  const getStatusColor = (status: string) => {
    switch (status) {
      case '계획': return 'default';
      case '진행중': return 'primary';
      case '완료': return 'success';
      case '지연': return 'error';
      default: return 'default';
    }
  };

  // 진행률 색상 매핑
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#4caf50'; // 녹색
    if (progress >= 50) return '#ff9800'; // 주황색
    return '#f44336'; // 빨간색
  };

  // 삭제 확인
  const handleDelete = (plan: ReviewPlan) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };

  // 실제 삭제 실행
  const confirmDelete = () => {
    if (selectedPlan) {
      setReviewPlans(prev => prev.filter(plan => plan.id !== selectedPlan.id));
      setDeleteDialogOpen(false);
      setSelectedPlan(null);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
            검토계획 관리
          </Typography>
          
          {/* 통계 카드 */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {reviewPlans.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    전체 계획
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    {reviewPlans.filter(p => p.status === '진행중').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    진행중
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {reviewPlans.filter(p => p.status === '완료').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    완료
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                    {reviewPlans.filter(p => p.status === '지연').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    지연
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* 필터 및 검색 영역 */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>분류</InputLabel>
                  <Select
                    value={filterCategory}
                    label="분류"
                    onChange={(e: SelectChangeEvent) => setFilterCategory(e.target.value)}
                  >
                    <MenuItem value="전체">전체</MenuItem>
                    <MenuItem value="법령">법령</MenuItem>
                    <MenuItem value="내부규정">내부규정</MenuItem>
                    <MenuItem value="계약서">계약서</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>상태</InputLabel>
                  <Select
                    value={filterStatus}
                    label="상태"
                    onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="전체">전체</MenuItem>
                    <MenuItem value="계획">계획</MenuItem>
                    <MenuItem value="진행중">진행중</MenuItem>
                    <MenuItem value="완료">완료</MenuItem>
                    <MenuItem value="지연">지연</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="검색"
                  placeholder="제목, 설명, 검토자 검색"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  신규 등록
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  엑셀 다운로드
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* 검토계획 테이블 */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>제목</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>분류</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>상태</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>검토자</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>시작일</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>완료예정일</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>진행률</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {plan.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {plan.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plan.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plan.status}
                        size="small"
                        color={getStatusColor(plan.status) as any}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{plan.reviewer}</TableCell>
                    <TableCell>{plan.startDate}</TableCell>
                    <TableCell>{plan.endDate}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 8,
                            backgroundColor: '#e0e0e0',
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${plan.progress}%`,
                              height: '100%',
                              backgroundColor: getProgressColor(plan.progress),
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </Box>
                        <Typography variant="caption">
                          {plan.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" color="primary">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(plan)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 결과가 없을 때 */}
          {filteredPlans.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                조건에 맞는 검토계획이 없습니다.
              </Typography>
            </Box>
          )}
        </Paper>

        {/* 삭제 확인 다이얼로그 */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>검토계획 삭제</DialogTitle>
          <DialogContent>
            <Typography>
              "{selectedPlan?.title}" 검토계획을 삭제하시겠습니까?
              <br />
              삭제된 데이터는 복구할 수 없습니다.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              삭제
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default ReviewPlanPage;
