/**
 * 점검 대상 선정 다이얼로그
 * 
 * 단일 책임 원칙(SRP): 점검 대상 선정 UI만을 담당
 * 개방-폐쇄 원칙(OCP): 새로운 필드 추가 시 기존 코드 수정 없이 확장 가능
 * 리스코프 치환 원칙(LSP): BaseDialog의 인터페이스를 준수
 * 인터페이스 분리 원칙(ISP): 각 기능별로 명확한 인터페이스 분리
 * 의존성 역전 원칙(DIP): 구체적인 구현이 아닌 추상화에 의존
 */

import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { DataGrid } from '@/shared/components/ui/data-display';
import type { GridRowSelectionModel } from '@mui/x-data-grid';
import type { DataGridColumn } from '@/shared/types/common';
import { apiClient } from '@/app/common/api/client';

/**
 * 점검 대상 항목 데이터 인터페이스
 * 
 * 책임: hod_ic_item 테이블 데이터 구조 정의
 */
export interface InspectionTargetItem {
  id: number;
  fieldTypeCd: string;      // 항목구분
  icTask: string;           // 내부통제업무
  measureType: string;      // 조치유형
  periodCd: string;         // 주기
  checkPeriod: string;      // 점검시기
  checkWay: string;         // 점검사항
}

/**
 * 점검 대상 선정 다이얼로그 Props 인터페이스
 * 
 * 인터페이스 분리 원칙: 필요한 기능만 노출
 */
interface InspectionTargetSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedItems: InspectionTargetItem[]) => void;
  ledgerOrdersHod: string;  // 책무번호
}

/**
 * 점검 대상 항목 조회 API
 */
const fetchInspectionTargets = async (ledgerOrdersHod: string): Promise<InspectionTargetItem[]> => {
  const response = await apiClient.get<InspectionTargetItem[]>(
    `/inquiry/hod-ic-items?ledgerOrdersHod=${ledgerOrdersHod}`
  );
  return response;
};

/**
 * 점검 대상 선정 다이얼로그 컴포넌트
 * 
 * 주요 책임:
 * - hod_ic_item 테이블 조회 및 표시
 * - 사용자의 점검 대상 선택 관리
 * - 선택된 항목을 부모 컴포넌트에 전달
 */
const InspectionTargetSelectionDialog: React.FC<InspectionTargetSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
  ledgerOrdersHod,
}) => {
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [selectedItems, setSelectedItems] = useState<InspectionTargetItem[]>([]);

  // 데이터 및 로딩 상태
  const [targets, setTargets] = useState<InspectionTargetItem[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 책무번호 기준으로 점검 대상 목록 조회
   */
  useEffect(() => {
    if (open && ledgerOrdersHod) {
      const loadTargets = async () => {
        try {
          setLoading(true);
          const data = await fetchInspectionTargets(ledgerOrdersHod);
          setTargets(data);
        } catch (error) {
          console.error('점검 대상 조회 오류:', error);
          setTargets([]);
        } finally {
          setLoading(false);
        }
      };
      loadTargets();
    }
  }, [open, ledgerOrdersHod]);

  /**
   * 그리드 컬럼 정의
   * 
   * 단일 책임: 그리드 표시 형식만 정의
   */
  const columns: DataGridColumn<InspectionTargetItem>[] = [
    { 
      field: 'fieldTypeCd', 
      headerName: '항목구분', 
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'icTask', 
      headerName: '내부통제업무', 
      flex: 1,
      minWidth: 200,
      headerAlign: 'center',
      align: 'left'
    },
    { 
      field: 'measureType', 
      headerName: '조치유형', 
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'periodCd', 
      headerName: '주기', 
      width: 100,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'checkPeriod', 
      headerName: '점검시기', 
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'checkWay', 
      headerName: '점검사항', 
      flex: 1,
      minWidth: 200,
      headerAlign: 'center',
      align: 'left'
    },
  ];

  /**
   * 선택 모델 변경 핸들러
   * 
   * 책임: 선택된 항목 추적 및 관리
   */
  const handleSelectionModelChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectionModel(newSelectionModel);
    
    // 선택된 항목 데이터 추출
    const selected = targets.filter((item: InspectionTargetItem) => 
      newSelectionModel.includes(item.id)
    );
    setSelectedItems(selected);
  };

  /**
   * 선택 완료 핸들러
   * 
   * 책임: 선택된 항목을 부모 컴포넌트에 전달
   */
  const handleSave = () => {
    onSelect(selectedItems);
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      mode="create"
      onClose={onClose}
      onSave={handleSave}
      title="점검 대상 선정"
      loading={loading}
      disableSave={selectedItems.length === 0}
      maxWidth="lg"
    >
      <Box sx={{ width: '100%', height: '600px' }}>
        {!ledgerOrdersHod ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            책무번호가 선택되지 않았습니다. 먼저 책무번호를 선택해주세요.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              선택된 책무번호({ledgerOrdersHod})에 해당하는 점검 대상 목록입니다.
              점검할 대상을 선택해주세요.
            </Typography>
            
            <DataGrid
              data={targets || []}
              columns={columns}
              checkboxSelection
              loading={loading}
              error={null}
              rowSelectionModel={selectionModel}
              onRowSelectionChange={handleSelectionModelChange}
              sx={{ height: 'calc(100% - 40px)' }}
            />

            {selectedItems.length > 0 && (
              <Typography variant="body2" sx={{ mt: 2, color: 'primary.main' }}>
                {selectedItems.length}개 항목이 선택되었습니다.
              </Typography>
            )}
          </>
        )}
      </Box>
    </BaseDialog>
  );
};

export default InspectionTargetSelectionDialog;