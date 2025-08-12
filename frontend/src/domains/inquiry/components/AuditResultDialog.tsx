/**
 * 점검결과작성 다이얼로그
 * 점검 결과를 작성하고 관리하는 팝업 컴포넌트
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  IconButton,
  List,
  ListItem,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { DatePicker, RadioGroup, type RadioOption } from '@/shared/components/ui/form';
import { TextField } from '@/shared/components/ui/data-display';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { getHodIcItemDetail, getAuditResultDetail, saveAuditResult, updateAuditResult, fileToBase64, type AuditResultSaveRequest, type AttachmentData } from '../api/auditResultApi';

// 점검 대상 항목 정보 타입
export interface AuditItemInfo {
  hodIcItemId: number;
  auditProgMngtDetailId: number;
  responsibilityContent: string;
  responsibilityDetailContent: string;
  positionsNm: string;
  deptCd: string;
  fieldTypeCd: string;
  roleTypeCd: string;
  icTask: string;
}

// HOD IC ITEM 상세 정보 타입
export interface HodIcItemDetail {
  hodIcItemId: number;
  responsibilityId: number;
  responsibilityContent: string;
  responsibilityDetailId: number;
  responsibilityDetailContent: string;
  ledgerOrder: number;
  orderStatus: string;
  approvalId: number;
  dateExpired: string;
  fieldTypeCd: string;
  roleTypeCd: string;
  deptCd: string;
  icTask: string;
  measureId: string;
  measureType: string;
  measureDesc: string;
  periodCd: string;
  supportDoc: string;
  checkPeriod: string;
  checkWay: string;
  proofDoc: string;
}

// 첨부파일 타입 (새로 업로드할 파일)
export interface AttachmentFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

// 통합 첨부파일 타입 (기존 + 새로 업로드)
export interface UnifiedAttachment {
  id: string;
  name: string;
  size: number;
  isExisting: boolean;
  file?: File;              // 새로 업로드할 파일인 경우
  attachId?: number;        // 기존 파일인 경우
  uploadDt?: string;        // 기존 파일인 경우
}

// 점검결과 데이터 타입
export interface AuditResultData {
  auditResultStatusCd: string;      // 점검결과
  auditResult: string;              // 점검결과작성
  beforeAuditYn: string;            // 이전회차 개선과제 동일 여부
  auditDetailContent: string;       // 개선계획 세부내용
  auditDoneDt: Date | null;         // 이행완료 예정일자
  attachments: UnifiedAttachment[];    // 첨부파일
}

export type DialogMode = 'create' | 'view' | 'edit';

interface AuditResultDialogProps {
  open: boolean;
  mode: DialogMode;
  onClose: () => void;
  onSave?: (data: AuditResultData) => Promise<void>;
  selectedItems: AuditItemInfo[];
  loading?: boolean;
}

const AuditResultDialog: React.FC<AuditResultDialogProps> = ({
  open,
  mode,
  onClose,
  onSave,
  selectedItems,
  loading = false,
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<AuditResultData>({
    auditResultStatusCd: '',
    auditResult: '',
    beforeAuditYn: '',
    auditDetailContent: '',
    auditDoneDt: null,
    attachments: [],
  });

  // HOD IC ITEM 상세 정보 상태 (선택된 모든 항목)
  const [hodIcItemDetails, setHodIcItemDetails] = useState<HodIcItemDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // 첨부파일 관련 상태
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 유효성 검사 상태
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 기존 점검결과 데이터 로드
  const loadExistingAuditResults = async () => {
    try {
      // 선택된 항목들의 auditProgMngtDetailId 추출
      const auditProgMngtDetailIds = selectedItems.map(item => item.auditProgMngtDetailId);
      const existingResults = await getAuditResultDetail(auditProgMngtDetailIds);
      // auditResultStatusCd가 있는 결과만 필터링
      const validResults = existingResults?.filter((result: any) => 
        result.auditResultStatusCd && result.auditResultStatusCd.trim() !== ''
      ) || [];

      if (validResults && validResults.length > 0) {
        // 첫 번째 결과를 기본값으로 사용 (여러 항목이 선택된 경우 공통된 값만 표시)
        const firstResult = validResults[0];
        // 기존 첨부파일을 UnifiedAttachment 형태로 변환
        let existingAttachments: UnifiedAttachment[] = [];
        if (firstResult.attachments && Array.isArray(firstResult.attachments)) {
          existingAttachments = firstResult.attachments.map((att: any) => ({
            id: `existing_${att.attachId}`,
            name: att.fileName,
            size: att.fileSize,
            isExisting: true,
            attachId: att.attachId,
            uploadDt: att.uploadDt,
          }));
        }
        
        // 폼 데이터 설정 - API 응답 구조에 맞게 안전하게 처리
        const newFormData = {
          auditResultStatusCd: firstResult.auditResultStatusCd || '',
          auditResult: firstResult.auditResult || '',
          beforeAuditYn: firstResult.beforeAuditYn || '',
          auditDetailContent: firstResult.auditDetailContent || '',
          auditDoneDt: firstResult.auditDoneDt ? new Date(firstResult.auditDoneDt) : null,
          attachments: existingAttachments,
        };
        
        // React 18의 상태 업데이트 방식에 맞게 수정
        setFormData(() => newFormData);
      } else {
      }
      
    } catch (error) {
      console.error('기존 점검결과 데이터 로드 오류:', error);
      // 오류 발생 시 빈 폼으로 유지
    }
  };

  // 다이얼로그가 열릴 때 데이터 로드
  useEffect(() => {
    if (open && selectedItems.length > 0) {
      
      
      // HOD IC ITEM 상세 정보 로드
      loadAllHodIcItemDetails();
      
      // view 또는 edit 모드인 경우 기존 데이터 로드
      if (mode === 'view' || mode === 'edit') {
        loadExistingAuditResults();
      } else {
        // create 모드인 경우 폼 초기화
        setFormData({
          auditResultStatusCd: '',
          auditResult: '',
          beforeAuditYn: '',
          auditDetailContent: '',
          auditDoneDt: null,
          attachments: [],
        });
      }
    }
  }, [open, selectedItems, mode]);

  // 선택된 모든 항목의 HOD IC ITEM 상세 정보 조회
  const loadAllHodIcItemDetails = async () => {
    try {
      setDetailLoading(true);
      
      // 선택된 모든 항목에 대해 병렬로 API 호출
      const promises = selectedItems.map(async (item) => {
        try {
          const response = await getHodIcItemDetail(item.hodIcItemId);
          
          // 응답 유효성 검사 - API 응답에서 id 대신 hodIcItemId 확인
          if (!response) {
            throw new Error(`유효하지 않은 API 응답: ${JSON.stringify(response)}`);
          }
          
          // 응답 타입 캐스팅
          const apiResponse = response as any;
          
          return {
            hodIcItemId: apiResponse.id || item.hodIcItemId,
            responsibilityId: apiResponse.responsibilityId,
            responsibilityContent: apiResponse.responsibilityContent,
            responsibilityDetailId: apiResponse.responsibilityDetailId,
            responsibilityDetailContent: apiResponse.responsibilityDetailContent,
            ledgerOrder: apiResponse.ledgerOrder,
            orderStatus: apiResponse.orderStatus || '',
            approvalId: apiResponse.approvalId || 0,
            dateExpired: apiResponse.dateExpired,
            fieldTypeCd: apiResponse.fieldTypeCd,
            roleTypeCd: apiResponse.roleTypeCd,
            deptCd: apiResponse.deptCd,
            icTask: apiResponse.icTask,
            measureId: apiResponse.measureId,
            measureType: apiResponse.measureType,
            measureDesc: apiResponse.measureDesc,
            periodCd: apiResponse.periodCd,
            supportDoc: apiResponse.supportDoc,
            checkPeriod: apiResponse.checkPeriod,
            checkWay: apiResponse.checkWay,
            proofDoc: apiResponse.proofDoc,
          };
        } catch (error) {
          console.error(`HOD IC ITEM 상세 정보 조회 오류 (ID: ${item.hodIcItemId}):`, error);
          // 오류 발생 시 기본값 반환
          return {
            hodIcItemId: item.hodIcItemId,
            responsibilityId: 0,
            responsibilityContent: '',
            responsibilityDetailId: 0,
            responsibilityDetailContent: '',
            ledgerOrder: 0,
            orderStatus: '',
            approvalId: 0,
            dateExpired: '',
            fieldTypeCd: '',
            roleTypeCd: '',
            deptCd: '',
            icTask: '',
            measureId: '',
            measureType: '',
            measureDesc: '',
            periodCd: '',
            supportDoc: '',
            checkPeriod: '',
            checkWay: '',
            proofDoc: '',
          };
        }
      });
      
      const results = await Promise.all(promises);
      setHodIcItemDetails(results);
      
    } catch (error) {
      console.error('HOD IC ITEM 상세 정보 일괄 조회 오류:', error);
      setHodIcItemDetails([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // 폼 데이터 변경 처리
  const handleFormChange = (field: keyof AuditResultData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 에러 메시지 클리어
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // 첨부파일 추가
  const handleFileAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setAttachmentError('');

    // 최대 3개 제한 확인
    if (formData.attachments.length + files.length > 3) {
      setAttachmentError('첨부파일은 최대 3개까지 등록 가능합니다.');
      return;
    }

    const newAttachments: UnifiedAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setAttachmentError(`${file.name}은 10MB를 초과할 수 없습니다.`);
        continue;
      }

      newAttachments.push({
        id: `${Date.now()}_${i}`,
        name: file.name,
        size: file.size,
        isExisting: false,
        file,
      });
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));

    // input 초기화
    event.target.value = '';
  };

  // 첨부파일 삭제
  const handleFileRemove = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id),
    }));
    setAttachmentError('');
  };

  // 기존 첨부파일 다운로드
  const handleFileDownload = async (attachment: UnifiedAttachment) => {
    if (!attachment.isExisting || !attachment.attachId) {
      console.error('다운로드할 수 없는 파일입니다.');
      return;
    }

    try {
      // 실제 구현에서는 파일 다운로드 API를 호출해야 합니다
      // TODO: 파일 다운로드 API 구현 필요
      // const blob = await downloadAttachment(attachment.attachId);
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = attachment.name;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
    }
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.auditResultStatusCd) {
      newErrors.auditResultStatusCd = '점검 결과를 선택해주세요.';
    }

    if (!formData.auditResult.trim()) {
      newErrors.auditResult = '점검결과작성을 입력해주세요.';
    }

    if (!formData.beforeAuditYn) {
      newErrors.beforeAuditYn = '이전회차 개선과제 동일 여부를 선택해주세요.';
    }

    if (!formData.auditDetailContent.trim()) {
      newErrors.auditDetailContent = '개선계획 세부내용을 입력해주세요.';
    }

    if (!formData.auditDoneDt) {
      newErrors.auditDoneDt = '이행완료 예정일자를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 첨부파일 처리
  const processAttachments = async (): Promise<AttachmentData[]> => {
    const attachmentDataList: AttachmentData[] = [];
    
    // 새로 업로드할 파일들만 처리
    const newFiles = formData.attachments.filter(att => !att.isExisting && att.file);
    
    for (const attachment of newFiles) {
      if (attachment.file) {
        try {
          const base64Data = await fileToBase64(attachment.file);
          attachmentDataList.push({
            fileName: attachment.name,
            fileSize: attachment.size,
            fileType: attachment.file.type,
            fileData: base64Data,
          });
        } catch (error) {
          console.error('파일 변환 오류:', error);
          throw new Error(`파일 ${attachment.name} 변환에 실패했습니다.`);
        }
      }
    }
    
    return attachmentDataList;
  };

  // 저장/수정 처리
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // 첨부파일 처리
      const attachmentData = await processAttachments();
      
      // API 요청 데이터 구성
      const requestData: AuditResultSaveRequest = {
        auditProgMngtDetailIds: selectedItems.map(item => item.auditProgMngtDetailId),
        auditResultStatusCd: formData.auditResultStatusCd,
        auditResult: formData.auditResult,
        beforeAuditYn: formData.beforeAuditYn,
        auditDetailContent: formData.auditDetailContent,
        auditDoneDt: formData.auditDoneDt ? formData.auditDoneDt.toISOString().split('T')[0] : '',
        attachments: attachmentData,
      };

      // 모드에 따라 다른 API 호출
      if (mode === 'edit') {
        await updateAuditResult(requestData);
      } else {
        await saveAuditResult(requestData);
      }

      // 사용자 정의 onSave 콜백이 있으면 호출
      if (onSave) {
        await onSave(formData);
      }

      handleClose();
    } catch (error) {
      console.error('점검결과 저장/수정 오류:', error);
      // 에러를 상위로 전파하지 않고 여기서 처리
    }
  };

  // 다이얼로그 닫기
  const handleClose = () => {
    setFormData({
      auditResultStatusCd: '',
      auditResult: '',
      beforeAuditYn: '',
      auditDetailContent: '',
      auditDoneDt: null,
      attachments: [],
    });
    setErrors({});
    setAttachmentError('');
    setHodIcItemDetails([]);
    onClose();
  };

  // 라디오버튼 옵션 정의
  const auditResultOptions: RadioOption[] = [
    { value: 'INS02', label: '적정' },
    { value: 'INS03', label: '미흡' },
    { value: 'INS04', label: '점검제외' },
  ];

  const beforeAuditOptions: RadioOption[] = [
    { value: 'Y', label: '예 (Y)' },
    { value: 'N', label: '아니오 (N)' },
  ];

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 모드별 제목 설정
  const getDialogTitle = () => {
    switch (mode) {
      case 'view': return '점검결과 상세조회';
      case 'edit': return '점검결과 수정';
      default: return '점검결과작성';
    }
  };

  // 저장 가능 여부 (기본 검증 조건 충족 시에만 저장 활성화)
  const canSave = mode !== 'view'
    && !!formData.auditResultStatusCd
    && formData.auditResult.trim() !== ''
    && !!formData.beforeAuditYn
    && formData.auditDetailContent.trim() !== ''
    && !!formData.auditDoneDt;

  return (
    <BaseDialog
      open={open}
      mode={mode}
      onClose={handleClose}
      onSave={handleSave}
      title={getDialogTitle()}
      maxWidth="lg"
      fullWidth
      loading={loading || detailLoading}
      showEditButton={false}
      disableSave={loading || detailLoading || !canSave}
    >
      <Box sx={{ p: 2, maxHeight: '80vh', overflow: 'auto' }}>
        {/* 선택된 항목 정보 */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" component="div" gutterBottom>
            선택된 점검 항목 ({selectedItems.length}건)
          </Typography>
          {selectedItems.map((item, index) => (
            <Box key={item.hodIcItemId} sx={{ mb: 1 }}>
              <Typography variant="body2" component="div">
                {index + 1}. {item.responsibilityContent} - {item.icTask}
              </Typography>
            </Box>
          ))}
        </Paper>

        {/* 1. 부서장 내부통제 업무 메뉴얼 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            1. 부서장 내부통제 업무 메뉴얼
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {hodIcItemDetails.map((detail, index) => (
            <Box key={detail.hodIcItemId} sx={{ mb: index < hodIcItemDetails.length - 1 ? 3 : 0 }}>
              <Typography variant="subtitle2" component="div" sx={{ mb: 2, color: 'primary.main' }}>
                항목 {index + 1} (ID: {detail.hodIcItemId})
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="책무 내용"
                    value={detail.responsibilityContent}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="책무상세 내용"
                    value={detail.responsibilityDetailContent}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="원장순서"
                    value={detail.ledgerOrder}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="순서상태"
                    value={detail.orderStatus}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="만료일자"
                    value={detail.dateExpired}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="항목구붆"
                    value={detail.fieldTypeCd}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="직무구분"
                    value={detail.roleTypeCd}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="부서코드"
                    value={detail.deptCd}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="주기"
                    value={detail.periodCd}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="관련근거"
                    value={detail.supportDoc}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="내부통제 업무"
                    value={detail.icTask}
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="조치 ID"
                    value={detail.measureId}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="조치유형"
                    value={detail.measureType}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="조치활동"
                    value={detail.measureDesc}
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    mode="readonly"
                  />
                </Grid>
              </Grid>
              {index < hodIcItemDetails.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Paper>

        {/* 2. 내부통제 업무 점검 가이드라인 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            2. 내부통제 업무 점검 가이드라인
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {hodIcItemDetails.map((detail, index) => (
            <Box key={detail.hodIcItemId} sx={{ mb: index < hodIcItemDetails.length - 1 ? 3 : 0 }}>
              <Typography variant="subtitle2" component="div" sx={{ mb: 2, color: 'primary.main' }}>
                항목 {index + 1} (ID: {detail.hodIcItemId})
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="점검시기"
                    value={detail.checkPeriod}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="점검방법"
                    value={detail.checkWay}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="증빙자료"
                    value={detail.proofDoc}
                    fullWidth
                    size="small"
                    mode="readonly"
                  />
                </Grid>
              </Grid>
              {index < hodIcItemDetails.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Paper>

        {/* 3. 점검 수행 결과 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            3. 점검 수행 결과
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RadioGroup
                label="점검 결과"
                value={formData.auditResultStatusCd}
                onChange={(value: string) => {
                  handleFormChange('auditResultStatusCd', value);
                }}
                options={auditResultOptions}
                row
                required
                error={!!errors.auditResultStatusCd}
                helperText={errors.auditResultStatusCd}
                disabled={mode === 'view'}
              />
              {/* 디버깅용 현재 값 표시 */}
              <Typography variant="caption" component="div" sx={{ display: 'block', mt: 1, color: 'info.main' }}>
                현재 auditResultStatusCd 값: "{formData.auditResultStatusCd}"
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="점검결과작성 *"
                value={formData.auditResult}
                onChange={(e) => {
                  handleFormChange('auditResult', e.target.value);
                }}
                fullWidth
                multiline
                rows={4}
                error={!!errors.auditResult}
                helperText={errors.auditResult}
                mode={mode === 'view' ? 'readonly' : 'editable'}
              />
              {/* 디버깅용 현재 값 표시 */}
              <Typography variant="caption" component="div" sx={{ display: 'block', mt: 1, color: 'info.main' }}>
                현재 auditResult 값: "{formData.auditResult}"
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* 4. 점검 수행 증빙자료 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            4. 점검 수행 증빙자료
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              multiple
              type="file"
              onChange={handleFileAdd}
            />
            <Button
              variant="outlined"
              startIcon={<AttachFileIcon />}
              disabled={formData.attachments.length >= 3 || mode === 'view'}
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              파일 첨부 ({formData.attachments.length}/3)
            </Button>
            {attachmentError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {attachmentError}
              </Alert>
            )}
          </Box>

          {formData.attachments.length > 0 && (
            <List dense>
              {formData.attachments.map((attachment) => (
                <ListItem key={attachment.id} divider>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" component="span">
                          {attachment.name}
                        </Typography>
                        {attachment.isExisting && (
                          <Typography variant="caption" component="span" color="primary" sx={{ fontSize: '0.75rem' }}>
                            (기존파일)
                          </Typography>
                        )}
                        {!attachment.isExisting && (
                          <Typography variant="caption" component="span" color="secondary" sx={{ fontSize: '0.75rem' }}>
                            (새파일)
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" component="span">
                          {formatFileSize(attachment.size)}
                        </Typography>
                        {attachment.isExisting && attachment.uploadDt && (
                          <Typography variant="caption" component="span" color="text.secondary">
                            업로드: {attachment.uploadDt}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {attachment.isExisting && (
                        <IconButton
                          size="small"
                          onClick={() => handleFileDownload(attachment)}
                          title="다운로드"
                        >
                          <DownloadIcon />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        onClick={() => handleFileRemove(attachment.id)}
                        size="small"
                        disabled={mode === 'view'}
                        title="삭제"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {/* 5. 개선계획 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            5. 개선계획
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RadioGroup
                label="이전회차의 개선과제와 동일한 건입니까?"
                value={formData.beforeAuditYn}
                onChange={(value: string) => handleFormChange('beforeAuditYn', value)}
                options={beforeAuditOptions}
                row
                required
                error={!!errors.beforeAuditYn}
                helperText={errors.beforeAuditYn}
                disabled={mode === 'view'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="개선계획 세부내용 *"
                value={formData.auditDetailContent}
                onChange={(e) => handleFormChange('auditDetailContent', e.target.value)}
                fullWidth
                multiline
                rows={4}
                error={!!errors.auditDetailContent}
                helperText={errors.auditDetailContent}
                mode={mode === 'view' ? 'readonly' : 'editable'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="이행완료 예정일자 *"
                value={formData.auditDoneDt}
                onChange={(date) => handleFormChange('auditDoneDt', date)}
                fullWidth
                error={!!errors.auditDoneDt}
                helperText={errors.auditDoneDt}
                format="yyyy-MM-dd"
                disabled={mode === 'view'}
              />
            </Grid>
          </Grid>
        </Paper>

      </Box>
    </BaseDialog>
  );
};

export default AuditResultDialog;