import type { CaseStudyDto } from '@/app/types/caseStudy';
import type { QnaListResponseDto } from '@/app/types/qna';
import { Dialog } from '@/shared/components/modal';
import type { ServerDataGridApi, ServerRequest } from '@/shared/components/ui/data-display';
import { ServerDataGrid } from '@/shared/components/ui/data-display';
import { Alert, Loading, useToastHelpers } from '@/shared/components/ui/feedback';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../../../assets/scss/style.css';
import { mainApi } from '../api/mainApi';

interface MainContentProps {
  className?: string;
}

const MainContent: React.FC<MainContentProps> = React.memo(({ className = '' }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConceptDialogOpen, setIsConceptDialogOpen] = useState(false);
  const [qaData, setQaData] = useState<QnaListResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseStudyData, setCaseStudyData] = useState<CaseStudyDto[]>([]);
  const [caseStudyError, setCaseStudyError] = useState<string | null>(null);

  const { showError, showSuccess } = useToastHelpers();

  // Q&A ServerDataGrid API 구현 (성능 최적화)
  const qaApi: ServerDataGridApi<QnaListResponseDto> = useMemo(
    () => ({
      fetchData: async (request: ServerRequest) => {
        try {
          const qnaList = await mainApi.getRecentQnaList(request.size || 5);
          const content = qnaList || [];


          const response = {
            content,
            totalElements: content.length,
            totalPages: 1,
            number: 0,
            size: request.size || 5,
            first: true,
            last: true,
            numberOfElements: content.length,
            empty: content.length === 0,
          };

          return response;
        } catch (err) {
          console.error('[MainContent] Q&A fetchData 에러:', err);
          const errorMessage =
            err instanceof Error ? err.message : 'Q&A 데이터를 불러오는데 실패했습니다.';
          showError(errorMessage);
          throw err;
        }
      },
      exportData: async (request: ServerRequest) => {
        const data = await mainApi.getRecentQnaList(request.size || 5);
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      },
      deleteRows: async (ids: (string | number)[]) => {
        showSuccess(`${ids.length}개 항목이 선택되었습니다.`);
      },
    }),
    [showError, showSuccess]
  );

  // Case Study ServerDataGrid API 구현 (성능 최적화)
  const caseStudyApi: ServerDataGridApi<CaseStudyDto> = useMemo(
    () => ({
      fetchData: async (request: ServerRequest) => {
        try {

          const caseStudies = await mainApi.getRecentCaseStudies(request.size || 5);
          const content = caseStudies || [];


          const response = {
            content,
            totalElements: content.length,
            totalPages: 1,
            number: 0,
            size: request.size || 5,
            first: true,
            last: true,
            numberOfElements: content.length,
            empty: content.length === 0,
          };

          return response;
        } catch (err) {
          console.error('[MainContent] Case Study fetchData 에러:', err);
          const errorMessage =
            err instanceof Error ? err.message : 'Case Study 데이터를 불러오는데 실패했습니다.';
          showError(errorMessage);
          throw err;
        }
      },
      exportData: async (request: ServerRequest) => {
        const data = await mainApi.getRecentCaseStudies(request.size || 5);
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      },
      deleteRows: async (ids: (string | number)[]) => {
        showSuccess(`${ids.length}개 항목이 선택되었습니다.`);
      },
    }),
    [showError, showSuccess]
  );

  // 컴포넌트 마운트 디버깅
  useEffect(() => {
    console.log('[MainContent] 컴포넌트가 마운트되었습니다.');
    return () => {
      console.log('[MainContent] 컴포넌트가 언마운트되었습니다.');
    };
  }, []);


  // Q&A 데이터 로드
  useEffect(() => {
    const loadQnaData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 최근 Q&A 목록 조회 (메인 화면용으로 5개만)
        const qnaList = await mainApi.getRecentQnaList(5);
        setQaData(qnaList || []);
      } catch (err: unknown) {
        console.error('[MainContent] Q&A 데이터 로드 실패:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Q&A 데이터를 불러오는데 실패했습니다.';
        setError(errorMessage);
        setQaData([]);
      } finally {
        setLoading(false);
      }
    };

    loadQnaData();
  }, []);

  // Q&A 컬럼 정의 (성능 최적화)
  const qaColumns: DataGridColumn<QnaListResponseDto>[] = useMemo(
    () => [
      { field: 'category', headerName: '카테고리', width: 120 },
      { field: 'title', headerName: '제목', width: 400, flex: 1 },
      { field: 'questionerName', headerName: '작성자', width: 120 },
      { field: 'createdAtFormatted', headerName: '작성일', width: 120 },
      { field: 'statusDescription', headerName: '상태', width: 100 },
    ],
    []
  );

  // Case Study 데이터 로드
  useEffect(() => {
    const loadCaseStudyData = async () => {
      try {
        setCaseStudyError(null);
        const caseStudies = await mainApi.getRecentCaseStudies(5);
        setCaseStudyData(caseStudies || []);
      } catch (err: unknown) {
        console.error('Case Study 데이터 로드 실패:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Case Study 데이터를 불러오는데 실패했습니다.';
        setCaseStudyError(errorMessage);
        setCaseStudyData([]);
      }
    };
    loadCaseStudyData();
  }, []);

  // Case Study 컬럼 정의 (성능 최적화)
  const caseStudyColumns: DataGridColumn<CaseStudyDto>[] = useMemo(
    () => [
      { field: 'caseStudyId', headerName: 'ID', width: 90 },
      { field: 'caseStudyTitle', headerName: '제목', width: 300 },
      { field: 'caseStudyContent', headerName: '내용', width: 300, flex: 1 },
      { field: 'createdId', headerName: '작성자', width: 120 },
      {
        field: 'createdAt',
        headerName: '작성일',
        width: 120,
        renderCell: ({ value }) => {
          if (!value) return '-';
          const date = new Date(value);
          return date
            .toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\. /g, '.')
            .replace(/\.$/, '');
        },
      },
    ],
    []
  );

  // 다이얼로그 핸들러들 (성능 최적화)
  const handleDialogOpen = useCallback(() => setIsDialogOpen(true), []);
  const handleDialogClose = useCallback(() => setIsDialogOpen(false), []);
  const handleConceptDialogOpen = useCallback(() => setIsConceptDialogOpen(true), []);
  const handleConceptDialogClose = useCallback(() => setIsConceptDialogOpen(false), []);

  return (
    <PageContainer
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <PageHeader
        title=' [100] 회의체 현황'
        icon={<GroupsIcon />}
        description='회의체별 현황 및 주요 심의·의결사항을 조회하고 관리합니다.'
        elevation={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
        }}
      />
      <PageContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          position: 'relative',
          py: 1,
          px: 0,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
     

        {/* 메인 콘텐츠 영역 */}
        <div className='responsibility-main'>
          {/* 상단 섹션 */}
          <div className='responsibility-section'>
            {/* 책무구조도의 기본 개념 */}
            <div
              className='responsibility-card'
              onClick={handleConceptDialogOpen}
              style={{ cursor: 'pointer' }}
            >
              <div className='responsibility-card__header'>
                <div className='responsibility-card__arrow'>
                  <svg viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' />
                  </svg>
                </div>
                <h3 className='responsibility-card__title'>책무구조도의 기본 개념</h3>
              </div>
              <div className='responsibility-card__content'>
                <div className='responsibility-card__image'>
                  <div className='document-stack'>
                    <div className='document-page'></div>
                    <div className='document-page'></div>
                    <div className='document-page'></div>
                  </div>
                </div>
                <div className='responsibility-card__text'>
                  <h4>책무구조도 무엇인가요?</h4>
                  <p>
                    임원 직책별로 부여된 구체적인 내용으로
                    <br />
                    기업의 문서(책무구조)에서 임원의
                    <br />
                    직책별 책무를 도식화한
                    <br />
                    문서(책무구조도)를 작성하여 이사회
                    <br />
                    직책을 거쳐 금융당국에 제출
                  </p>
                </div>
              </div>
            </div>

            {/* 금융당국 · 협회 등 자료료 */}
            <div
              className='responsibility-card'
              onClick={handleDialogOpen}
              style={{ cursor: 'pointer' }}
            >
              <div className='responsibility-card__header'>
                <div className='responsibility-card__arrow'>
                  <svg viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' />
                  </svg>
                </div>
                <h3 className='responsibility-card__title'>금융당국 · 협회 등 자료</h3>
              </div>
              <div className='responsibility-card__content'>
                <div className='responsibility-card__image'>
                  <div className='document-stack'>
                    <div className='document-page'></div>
                    <div className='document-page'></div>
                  </div>
                </div>
                <div className='responsibility-card__text'>
                  <h4>책무구조도 등 제재 지침·법령 해설서</h4>
                  <p>
                    임원 책무에 대한 부서장 내부통제
                    <br />
                    점검으로서 내부통제
                    <br />
                    이행점검 점검항목을 이행하지 않은 경우지로
                    <br />
                    내부통제 Checklist와는
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Q&A 섹션 */}
          <div className='responsibility-section'>
            <div className='responsibility-card responsibility-card--full'>
              <div className='responsibility-card__header'>
                <div className='responsibility-card__arrow'>
                  <svg viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' />
                  </svg>
                </div>
                <h3 className='responsibility-card__title'>Q&A</h3>
              </div>
              <div className='responsibility-card__content'>
                <Box sx={{ height: 300, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  {loading ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      <Loading />
                    </Box>
                  ) : error ? (
                    <Box sx={{ p: 2 }}>
                      <Alert severity='error'>{error}</Alert>
                    </Box>
                  ) : !Array.isArray(qaData) || qaData.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Alert severity='info'>등록된 Q&A가 없습니다.</Alert>
                    </Box>
                  ) : (
                    <ServerDataGrid
                      api={qaApi}
                      columns={qaColumns}
                      height='100%'
                      autoHeight={false}
                      rowIdField='id'
                      searchable={false}
                      refreshable={false}
                      toolbar={false}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 5 },
                        },
                      }}
                      pageSizeOptions={[5, 10]}
                      disableRowSelectionOnClick
                      sx={{
                        height: '100%',
                        border: 'none',
                        borderRadius: '0px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        overflow: 'hidden',
                        '& .MuiDataGrid-cell': {
                          fontSize: '0.875rem',
                          padding: '16px 20px',
                          borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                          transition: 'all 0.2s ease-in-out',
                          display: 'flex',
                          alignItems: 'center',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: '#9ca3af !important',
                          color: 'white !important',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          borderBottom: 'none !important',
                          minHeight: '56px !important',
                          '& .MuiDataGrid-columnSeparator': {
                            color: 'rgba(255, 255, 255, 0.3)',
                          },
                        },
                        '& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader': {
                          backgroundColor: '#9ca3af !important',
                        },
                        '& .MuiDataGrid-columnHeader': {
                          backgroundColor: '#9ca3af !important',
                          color: 'white !important',
                          '&:focus': {
                            outline: 'none',
                          },
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                          color: 'white !important',
                          fontWeight: '600 !important',
                          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          letterSpacing: '0.5px',
                        },
                        '& .MuiDataGrid-columnHeaderTitleContainer': {
                          color: 'white !important',
                        },
                        '& .MuiDataGrid-row': {
                          backgroundColor: 'white',
                          '&:nth-of-type(even)': {
                            backgroundColor: '#f8fafc',
                          },
                          '&:hover': {
                            backgroundColor: '#a7f3d0',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 20px rgba(20, 160, 133, 0.15)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '& .MuiDataGrid-cell': {
                              color: '#0d7377',
                              fontWeight: '500',
                            },
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#99f6e4',
                            '&:hover': {
                              backgroundColor: '#7dd3fc',
                            },
                          },
                        },
                        '& .MuiDataGrid-footerContainer': {
                          backgroundColor: '#f1f5f9',
                          borderTop: '1px solid rgba(224, 224, 224, 0.5)',
                        },
                        '& .MuiDataGrid-virtualScroller': {
                          backgroundColor: 'white',
                        },
                        '& .MuiDataGrid-overlay': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                    />
                  )}
                </Box>
              </div>
            </div>
          </div>

          {/* Case Study 섹션 */}
          <div className='responsibility-section'>
            <div className='responsibility-card responsibility-card--full'>
              <div className='responsibility-card__header'>
                <div className='responsibility-card__arrow'>
                  <svg viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' />
                  </svg>
                </div>
                <h3 className='responsibility-card__title'>Case Study</h3>
              </div>
              <div className='responsibility-card__content'>
                <Box sx={{ height: 300, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  {caseStudyError ? (
                    <Box sx={{ p: 2 }}>
                      <Alert severity='error'>{caseStudyError}</Alert>
                    </Box>
                  ) : !Array.isArray(caseStudyData) || caseStudyData.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Alert severity='info'>등록된 Case Study가 없습니다.</Alert>
                    </Box>
                  ) : (
                    <ServerDataGrid
                      api={caseStudyApi}
                      columns={caseStudyColumns}
                      height='100%'
                      autoHeight={false}
                      rowIdField='caseStudyId'
                      searchable={false}
                      refreshable={false}
                      toolbar={false}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 5 },
                        },
                      }}
                      pageSizeOptions={[5, 10]}
                      disableRowSelectionOnClick
                      sx={{
                        height: '100%',
                        border: 'none',
                        borderRadius: '0px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        overflow: 'hidden',
                        '& .MuiDataGrid-cell': {
                          fontSize: '0.875rem',
                          padding: '16px 20px',
                          borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                          transition: 'all 0.2s ease-in-out',
                          display: 'flex',
                          alignItems: 'center',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: '#9ca3af !important',
                          color: 'white !important',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          borderBottom: 'none !important',
                          minHeight: '56px !important',
                          '& .MuiDataGrid-columnSeparator': {
                            color: 'rgba(255, 255, 255, 0.3)',
                          },
                        },
                        '& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader': {
                          backgroundColor: '#9ca3af !important',
                        },
                        '& .MuiDataGrid-columnHeader': {
                          backgroundColor: '#9ca3af !important',
                          color: 'white !important',
                          '&:focus': {
                            outline: 'none',
                          },
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                          color: 'white !important',
                          fontWeight: '600 !important',
                          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          letterSpacing: '0.5px',
                        },
                        '& .MuiDataGrid-columnHeaderTitleContainer': {
                          color: 'white !important',
                        },
                      }}
                    />
                  )}
                </Box>
              </div>
            </div>
          </div>

          {/* 나의 업무 섹션 */}
          <div className='responsibility-section'>
            <div className='responsibility-card responsibility-card--full'>
              <div className='responsibility-card__header'>
                <div className='responsibility-card__arrow'>
                  <svg viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' />
                  </svg>
                </div>
                <h3 className='responsibility-card__title'>나의 업무</h3>
              </div>
              <div className='responsibility-card__content'>
                <div className='my-work-grid'>
                  {/* 점검 수행 */}
                  <div className='my-work-item'>
                    <div className='my-work-icon my-work-icon--inspection'>
                      <svg viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' />
                      </svg>
                    </div>
                    <h4>점검 수행</h4>
                    <div className='my-work-buttons'>
                      <button className='my-work-button'>
                        <span className='my-work-count'>0</span>
                        <span>점검자 지정</span>
                      </button>
                      <button className='my-work-button'>
                        <span className='my-work-count'>0</span>
                        <span>점검결과 작성</span>
                      </button>
                    </div>
                  </div>

                  {/* 개선 이행 */}
                  <div className='my-work-item'>
                    <div className='my-work-icon my-work-icon--improvement'>
                      <svg viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                      </svg>
                    </div>
                    <h4>개선 이행</h4>
                    <div className='my-work-buttons'>
                      <button className='my-work-button'>
                        <span className='my-work-count'>0</span>
                        <span>개선계획 및 이행결과 작성 (의견작성)</span>
                      </button>
                      <button className='my-work-button'>
                        <span className='my-work-count'>0</span>
                        <span>개선계획 및 이행결과 승인 (의견작성)</span>
                      </button>
                    </div>
                  </div>

                  {/* 결과 보고 */}
                  <div className='my-work-item'>
                    <div className='my-work-icon my-work-icon--report'>
                      <svg viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z' />
                      </svg>
                    </div>
                    <h4>결과 보고</h4>
                    <div className='my-work-buttons'>
                      <button className='my-work-button'>
                        <span className='my-work-count'>0</span>
                        <span>결과보고 작성 (승인요청)</span>
                      </button>
                      <button className='my-work-button'>
                        <span className='my-work-count'>0</span>
                        <span>결과보고 작성 (의견작성)</span>
                      </button>
                    </div>
                  </div>

                  {/* 일정관리 */}
                  <div className='my-work-item'>
                    <div className='my-work-icon my-work-icon--schedule'>
                      <svg viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' />
                      </svg>
                    </div>
                    <h4>일정관리</h4>
                    <div className='my-work-buttons'>
                      <button className='my-work-button'>
                        <span className='my-work-count'>1</span>
                        <span>임원 책무기준서 신규/변경 승인</span>
                      </button>
                      <button className='my-work-button'>
                        <span className='my-work-count'>1</span>
                        <span>부서장 업무매뉴얼 신규/변경 승인</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 책무구조도 이사회 의결 대상 사안 */}
          <div className='responsibility-section'>
            <div className='responsibility-card responsibility-card--full'>
              <div className='responsibility-card__header'>
                <div className='responsibility-card__arrow'>
                  <svg viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' />
                  </svg>
                </div>
                <h3 className='responsibility-card__title'>책무구조도 이사회 의결 대상 사안</h3>
              </div>
              <div className='responsibility-card__content'>
                <div className='board-agenda-list'>
                  <div className='board-agenda-item'>
                    <span>임원 신규 선임 및 책무를 배정 받은 임원의 변경</span>
                  </div>
                  <div className='board-agenda-item'>
                    <span>임원 직책의 변경</span>
                  </div>
                  <div className='board-agenda-item'>
                    <span>임원 책무의 변경 (관리업무 재외)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 금융당국 · 협회 등 자료 팝업 */}
        <Dialog
          open={isDialogOpen}
          title='금융당국 · 협회 등 자료'
          maxWidth='md'
          onClose={handleDialogClose}
        >
          <div className='guidance-popup'>
            <div className='guidance-popup__header'>
              <h3 className='guidance-popup__title'>금융당국 · 협회 등 자료</h3>
            </div>

            <div className='guidance-popup__content'>
              <div className='guidance-grid'>
                <div className='guidance-grid__header'>
                  <div className='guidance-grid__cell guidance-grid__cell--header'>
                    책무구조도 등 제재 지침·법령 해설서
                  </div>
                  <div className='guidance-grid__cell guidance-grid__cell--header'>금융감독원</div>
                  <div className='guidance-grid__cell guidance-grid__cell--header'>📄</div>
                </div>
                <div className='guidance-grid__body'>
                  <div className='guidance-grid__row'>
                    <div className='guidance-grid__cell'>금융회사 지배구조 감독규정 시행세칙</div>
                    <div className='guidance-grid__cell'>금융감독원</div>
                    <div className='guidance-grid__cell'>📄</div>
                  </div>
                  <div className='guidance-grid__row'>
                    <div className='guidance-grid__cell'>상업은 주요 관리 기준</div>
                    <div className='guidance-grid__cell'>은행연합회</div>
                    <div className='guidance-grid__cell'>📄</div>
                  </div>
                  <div className='guidance-grid__row'>
                    <div className='guidance-grid__cell'>중요업무 책무구조도 모범규준</div>
                    <div className='guidance-grid__cell'>금융투자협회</div>
                    <div className='guidance-grid__cell'>📄</div>
                  </div>
                  <div className='guidance-grid__row'>
                    <div className='guidance-grid__cell'>-</div>
                    <div className='guidance-grid__cell'>-</div>
                    <div className='guidance-grid__cell'>-</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>

        {/* 책무구조도의 기본 개념 팝업 */}
        <Dialog
          open={isConceptDialogOpen}
          title='책무구조도 무엇인가요?'
          maxWidth='md'
          onClose={handleConceptDialogClose}
        >
          <div className='concept-popup'>
            <div className='concept-popup__header'>
              <h3 className='concept-popup__title'>책무구조도 무엇인가요?</h3>
            </div>

            <div className='concept-popup__content'>
              <div className='concept-grid'>
                <div className='concept-grid__header'>
                  <div className='concept-grid__cell concept-grid__cell--header'>구분</div>
                  <div className='concept-grid__cell concept-grid__cell--header'>내용</div>
                  <div className='concept-grid__cell concept-grid__cell--header'>비고</div>
                </div>
                <div className='concept-grid__body'>
                  <div className='concept-grid__row'>
                    <div className='concept-grid__cell'>정의</div>
                    <div className='concept-grid__cell'>
                      임원 직책별로 부여된 구체적인 내용으로 기업의 문서(책무구조)에서 임원의 직책별
                      책무를 도식화한 문서
                    </div>
                    <div className='concept-grid__cell'>금융감독원</div>
                  </div>
                  <div className='concept-grid__row'>
                    <div className='concept-grid__cell'>목적</div>
                    <div className='concept-grid__cell'>
                      임원의 책무와 권한을 명확히 하여 효과적인 내부통제 체계 구축
                    </div>
                    <div className='concept-grid__cell'>내부통제</div>
                  </div>
                  <div className='concept-grid__row'>
                    <div className='concept-grid__cell'>법적근거</div>
                    <div className='concept-grid__cell'>금융회사의 지배구조에 관한 법률 제16조</div>
                    <div className='concept-grid__cell'>법령</div>
                  </div>
                  <div className='concept-grid__row'>
                    <div className='concept-grid__cell'>작성주기</div>
                    <div className='concept-grid__cell'>연 1회 이상 또는 조직 변경 시</div>
                    <div className='concept-grid__cell'>정기</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </PageContent>
    </PageContainer>
  );
});

MainContent.displayName = 'MainContent';

export default MainContent;
