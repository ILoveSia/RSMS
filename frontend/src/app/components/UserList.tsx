/**
 * 사용자 목록 컴포넌트
 * 
 * React 19 + MUI v7을 활용한 사용자 목록 표시 컴포넌트입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사용자 목록 표시만 담당
 * - Open/Closed: 확장에는 열려있고 수정에는 닫혀있음
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { userApi, type User, type UserSearchParams, UserRole } from '../common/api/userApi';

interface UserListProps {
  onEditUser?: (user: User) => void;
  onCreateUser?: () => void;
}

export default function UserList({ onEditUser, onCreateUser }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  
  // 검색 필터
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    username: '',
    email: '',
    fullName: '',
    role: undefined,
    isActive: undefined,
  });

  // 사용자 목록 조회
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: UserSearchParams = {
        ...searchParams,
        page,
        size: rowsPerPage,
        sort: 'createdAt',
        direction: 'desc',
      };
      
      // 빈 문자열 필터링
      Object.keys(params).forEach(key => {
        const value = params[key as keyof UserSearchParams];
        if (value === '') {
          delete params[key as keyof UserSearchParams];
        }
      });
      
      const response = await userApi.getUsers(params);
      
      if (response.success && response.data) {
        setUsers(response.data.content);
        setTotalElements(response.data.totalElements);
      } else {
        setError(response.message || '사용자 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('사용자 목록을 불러오는 중 오류가 발생했습니다.');
      console.error('사용자 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 삭제
  const handleDeleteUser = async (id: number) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const response = await userApi.deleteUser(id);
      if (response.success) {
        await fetchUsers(); // 목록 새로고침
      } else {
        setError(response.message || '사용자 삭제에 실패했습니다.');
      }
    } catch (err) {
      setError('사용자 삭제 중 오류가 발생했습니다.');
      console.error('사용자 삭제 오류:', err);
    }
  };

  // 사용자 활성화/비활성화
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await userApi.updateUserActiveStatus(id, !currentStatus);
      if (response.success) {
        await fetchUsers(); // 목록 새로고침
      } else {
        setError(response.message || '사용자 상태 변경에 실패했습니다.');
      }
    } catch (err) {
      setError('사용자 상태 변경 중 오류가 발생했습니다.');
      console.error('사용자 상태 변경 오류:', err);
    }
  };

  // 검색 실행
  const handleSearch = () => {
    setPage(0); // 검색 시 첫 페이지로
    fetchUsers();
  };

  // 검색 초기화
  const handleResetSearch = () => {
    setSearchParams({
      username: '',
      email: '',
      fullName: '',
      role: undefined,
      isActive: undefined,
    });
    setPage(0);
  };

  // 페이지 변경
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // 페이지 크기 변경
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 역할 표시 색상
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'error';
      case UserRole.ADMIN:
        return 'warning';
      case UserRole.USER:
        return 'primary';
      default:
        return 'default';
    }
  };

  // 역할 표시 텍스트
  const getRoleText = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return '슈퍼 관리자';
      case UserRole.ADMIN:
        return '관리자';
      case UserRole.USER:
        return '일반 사용자';
      default:
        return role;
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            사용자 관리
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateUser}
          >
            사용자 추가
          </Button>
        </Box>

        {/* 검색 필터 */}
        <Box mb={3}>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              label="사용자명"
              size="small"
              value={searchParams.username}
              onChange={(e) => setSearchParams((prev: UserSearchParams) => ({ ...prev, username: e.target.value }))}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="이메일"
              size="small"
              value={searchParams.email}
              onChange={(e) => setSearchParams((prev: UserSearchParams) => ({ ...prev, email: e.target.value }))}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="실명"
              size="small"
              value={searchParams.fullName}
              onChange={(e) => setSearchParams((prev: UserSearchParams) => ({ ...prev, fullName: e.target.value }))}
              sx={{ minWidth: 150 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>역할</InputLabel>
              <Select
                value={searchParams.role || ''}
                label="역할"
                onChange={(e) => setSearchParams((prev: UserSearchParams) => ({ 
                  ...prev, 
                  role: e.target.value ? e.target.value as UserRole : undefined 
                }))}
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value={UserRole.USER}>일반 사용자</MenuItem>
                <MenuItem value={UserRole.ADMIN}>관리자</MenuItem>
                <MenuItem value={UserRole.SUPER_ADMIN}>슈퍼 관리자</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>상태</InputLabel>
              <Select
                value={searchParams.isActive !== undefined ? searchParams.isActive.toString() : ''}
                label="상태"
                onChange={(e) => setSearchParams((prev: UserSearchParams) => ({ 
                  ...prev, 
                  isActive: e.target.value ? e.target.value === 'true' : undefined 
                }))}
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="true">활성</MenuItem>
                <MenuItem value="false">비활성</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              검색
            </Button>
            <Button
              variant="text"
              startIcon={<RefreshIcon />}
              onClick={handleResetSearch}
            >
              초기화
            </Button>
          </Box>
        </Box>

        {/* 오류 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {/* 사용자 테이블 */}
        {!loading && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>사용자명</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>실명</TableCell>
                  <TableCell>역할</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>생성일</TableCell>
                  <TableCell align="center">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleText(user.role)}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? '활성' : '비활성'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="수정">
                        <IconButton
                          size="small"
                          onClick={() => onEditUser?.(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* 페이지네이션 */}
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="페이지당 행 수:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} / ${count !== -1 ? count : `${to}개 이상`}`
          }
        />
      </CardContent>
    </Card>
  );
} 