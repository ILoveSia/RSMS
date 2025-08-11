/**
 * 점검자 지정 다이얼로그
 * 점검 항목에 점검자를 지정하는 팝업 컴포넌트
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper
} from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import { searchAuditorsByName, type AuditorInfo } from '../api/auditorApi';

// 점검자 정보 인터페이스 (API에서 import하므로 제거)
// export interface AuditorInfo는 API에서 import함

// 점검자 지정 다이얼로그 Props
export interface AuditorAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (auditorEmpNo: string, auditorName: string) => Promise<void>;
  selectedItemIds: string[];
  loading?: boolean;
}

const AuditorAssignmentDialog: React.FC<AuditorAssignmentDialogProps> = ({
  open,
  onClose,
  onAssign,
  selectedItemIds,
  loading = false
}) => {
  // 검색 상태
  const [searchName, setSearchName] = useState<string>('');
  const [auditorList, setAuditorList] = useState<AuditorInfo[]>([]);
  const [selectedAuditor, setSelectedAuditor] = useState<AuditorInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 점검자 검색
  const handleSearchAuditor = useCallback(async () => {
    if (!searchName.trim()) {
      alert('성명을 입력해주세요.');
      return;
    }

    try {
      setIsSearching(true);
      
      // 실제 API 호출
      const response = await searchAuditorsByName(searchName);
      
      setAuditorList(response);
      
      if (response.length === 0) {
        alert('검색된 직원이 없습니다.');
      }
      
    } catch (error) {
      console.error('점검자 검색 오류:', error);
      alert('점검자 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  }, [searchName]);

  // 점검자 선택
  const handleAuditorSelection = (auditor: AuditorInfo) => {
    setSelectedAuditor(auditor);
  };

  // 점검자 지정 저장
  const handleSaveAssignment = async () => {
    if (!selectedAuditor) {
      alert('점검자를 선택해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      
      await onAssign(selectedAuditor.empNo, selectedAuditor.empName);
      
      // 성공 후 초기화
      handleClose();
      
    } catch (error) {
      console.error('점검자 지정 저장 오류:', error);
      alert('점검자 지정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 다이얼로그 닫기
  const handleClose = () => {
    setSearchName('');
    setAuditorList([]);
    setSelectedAuditor(null);
    onClose();
  };

  // Enter 키 검색
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchAuditor();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '600px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon />
        점검자 지정
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {/* 선택된 항목 정보 */}
        <Box sx={{ p: 2, backgroundColor: 'var(--bank-bg-secondary)', borderRadius: 1, border: '1px solid var(--bank-border)' }}>
          <Typography variant="body2" color="text.secondary">
            선택된 점검 항목: {selectedItemIds.length}개
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selectedItemIds.slice(0, 5).map((id) => (
              <Chip key={id} label={`항목 ${id}`} size="small" />
            ))}
            {selectedItemIds.length > 5 && (
              <Chip label={`외 ${selectedItemIds.length - 5}개`} size="small" color="primary" />
            )}
          </Box>
        </Box>

        {/* 점검자 검색 */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            label="성명"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{ flex: 1 }}
            placeholder="검색할 성명을 입력하세요"
          />
          <Button
            variant="contained"
            onClick={handleSearchAuditor}
            disabled={isSearching}
            startIcon={<SearchIcon />}
            sx={{ minWidth: '100px' }}
          >
            {isSearching ? '검색 중...' : '조회'}
          </Button>
        </Box>

        {/* 선택된 점검자 정보 */}
        {selectedAuditor && (
          <Box sx={{ p: 2, backgroundColor: 'var(--bank-primary-bg)', borderRadius: 1, border: '1px solid var(--bank-primary)' }}>
            <Typography variant="body2" color="primary" fontWeight="bold">
              선택된 점검자
            </Typography>
            <Typography variant="body2">
              {selectedAuditor.empName} ({selectedAuditor.empNo}) - {selectedAuditor.deptName} {selectedAuditor.positionName}
            </Typography>
          </Box>
        )}

        {/* 점검자 목록 테이블 */}
        <Box sx={{ flex: 1, minHeight: 300 }}>
          <TableContainer component={Paper} sx={{ height: '100%', overflow: 'auto', backgroundColor: 'var(--bank-bg-paper)' }}>
            <Table stickyHeader>
              <TableHead sx={{ '& .MuiTableCell-root': { backgroundColor: 'var(--bank-bg-secondary)', borderBottom: '1px solid var(--bank-border)' } }}>
                <TableRow>
                  <TableCell>사번</TableCell>
                  <TableCell>성명</TableCell>
                  <TableCell>부서</TableCell>
                  <TableCell>직급</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isSearching ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">검색 중...</TableCell>
                  </TableRow>
                ) : auditorList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">검색 결과가 없습니다.</TableCell>
                  </TableRow>
                ) : (
                  auditorList.map((auditor) => (
                    <TableRow
                      key={auditor.empNo}
                      onClick={() => handleAuditorSelection(auditor)}
                      selected={selectedAuditor?.empNo === auditor.empNo}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'var(--bank-primary-bg)'
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'var(--bank-primary-bg)'
                        }
                      }}
                    >
                      <TableCell>{auditor.empNo}</TableCell>
                      <TableCell>{auditor.empName}</TableCell>
                      <TableCell>{auditor.deptName}</TableCell>
                      <TableCell>{auditor.positionName}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isSaving}
          color="inherit"
        >
          취소
        </Button>
        <Button
          onClick={handleSaveAssignment}
          variant="contained"
          disabled={!selectedAuditor || isSaving}
          color="primary"
        >
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuditorAssignmentDialog;