/**
 * 인수인계 관리 Redux Slice
 * 인수인계 관련 상태 관리를 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 상태 관리만 담당
 * - Open/Closed: 새로운 액션/상태 추가 시 확장 가능
 * - Liskov Substitution: Redux Slice 인터페이스 준수
 * - Interface Segregation: 인수인계 관련 상태만 관리
 * - Dependency Inversion: Redux Toolkit에 의존
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  HandoverApi, 
  HandoverAssignment, 
  HandoverAssignmentDto, 
  HandoverSearchParams,
  HandoverStatistics
} from '../api/handoverApi';
import { PageResponse, PaginationParams } from '@/shared/types/api';

// State Types
export interface HandoverState {
  assignments: HandoverAssignmentDto[];
  currentAssignment: HandoverAssignmentDto | null;
  statistics: HandoverStatistics | null;
  totalElements: number;
  loading: boolean;
  error: string | null;
  searchParams: HandoverSearchParams;
  paginationParams: PaginationParams;
}

// Initial State
const initialState: HandoverState = {
  assignments: [],
  currentAssignment: null,
  statistics: null,
  totalElements: 0,
  loading: false,
  error: null,
  searchParams: {},
  paginationParams: {
    page: 0,
    size: 10,
    sort: 'createdAt,desc'
  }
};

// Async Thunks
export const fetchHandoverAssignments = createAsyncThunk(
  'handover/fetchAssignments',
  async (params?: { search?: HandoverSearchParams; pagination?: PaginationParams }) => {
    const { search = {}, pagination = initialState.paginationParams } = params || {};
    
    if (Object.keys(search).length > 0) {
      return await HandoverApi.searchHandoverAssignments(search, pagination);
    } else {
      return await HandoverApi.getAllHandoverAssignments(pagination);
    }
  }
);

export const fetchHandoverAssignment = createAsyncThunk(
  'handover/fetchAssignment',
  async (assignmentId: number) => {
    return await HandoverApi.getHandoverAssignment(assignmentId);
  }
);

export const createHandoverAssignment = createAsyncThunk(
  'handover/createAssignment',
  async (data: HandoverAssignment) => {
    return await HandoverApi.createHandoverAssignment(data);
  }
);

export const updateHandoverAssignment = createAsyncThunk(
  'handover/updateAssignment',
  async ({ assignmentId, data }: { assignmentId: number; data: HandoverAssignment }) => {
    return await HandoverApi.updateHandoverAssignment(assignmentId, data);
  }
);

export const deleteHandoverAssignment = createAsyncThunk(
  'handover/deleteAssignment',
  async (assignmentId: number) => {
    await HandoverApi.deleteHandoverAssignment(assignmentId);
    return assignmentId;
  }
);

export const startHandover = createAsyncThunk(
  'handover/startHandover',
  async ({ assignmentId, actorEmpNo }: { assignmentId: number; actorEmpNo: string }) => {
    await HandoverApi.startHandover(assignmentId, actorEmpNo);
    return assignmentId;
  }
);

export const completeHandover = createAsyncThunk(
  'handover/completeHandover',
  async ({ assignmentId, actorEmpNo }: { assignmentId: number; actorEmpNo: string }) => {
    await HandoverApi.completeHandover(assignmentId, actorEmpNo);
    return assignmentId;
  }
);

export const cancelHandover = createAsyncThunk(
  'handover/cancelHandover',
  async ({ 
    assignmentId, 
    actorEmpNo, 
    reason 
  }: { 
    assignmentId: number; 
    actorEmpNo: string; 
    reason?: string;
  }) => {
    await HandoverApi.cancelHandover(assignmentId, actorEmpNo, reason);
    return assignmentId;
  }
);

export const fetchHandoverStatistics = createAsyncThunk(
  'handover/fetchStatistics',
  async () => {
    return await HandoverApi.getHandoverStatistics();
  }
);

export const fetchActiveHandovers = createAsyncThunk(
  'handover/fetchActiveHandovers',
  async () => {
    return await HandoverApi.getActiveHandovers();
  }
);

export const fetchDelayedHandovers = createAsyncThunk(
  'handover/fetchDelayedHandovers',
  async () => {
    return await HandoverApi.getDelayedHandovers();
  }
);

export const fetchHandoversByEmployee = createAsyncThunk(
  'handover/fetchByEmployee',
  async (empNo: string) => {
    return await HandoverApi.getHandoverAssignmentsByEmployee(empNo);
  }
);

export const fetchHandoversByPosition = createAsyncThunk(
  'handover/fetchByPosition',
  async (positionId: number) => {
    return await HandoverApi.getHandoverAssignmentsByPosition(positionId);
  }
);

// Slice
const handoverSlice = createSlice({
  name: 'handover',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<HandoverSearchParams>) => {
      state.searchParams = action.payload;
    },
    setPaginationParams: (state, action: PayloadAction<PaginationParams>) => {
      state.paginationParams = action.payload;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => initialState
  },
  extraReducers: (builder) => {
    // Fetch assignments
    builder
      .addCase(fetchHandoverAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHandoverAssignments.fulfilled, (state, action) => {
        state.loading = false;
        if ('content' in action.payload) {
          // PageResponse
          const pageResponse = action.payload as PageResponse<HandoverAssignmentDto>;
          state.assignments = pageResponse.content;
          state.totalElements = pageResponse.totalElements;
        } else {
          // Array response
          state.assignments = action.payload as HandoverAssignmentDto[];
          state.totalElements = state.assignments.length;
        }
      })
      .addCase(fetchHandoverAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '인수인계 목록 조회에 실패했습니다.';
      })

    // Fetch single assignment
      .addCase(fetchHandoverAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHandoverAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload as HandoverAssignmentDto;
      })
      .addCase(fetchHandoverAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '인수인계 조회에 실패했습니다.';
      })

    // Create assignment
      .addCase(createHandoverAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHandoverAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.unshift(action.payload as HandoverAssignmentDto);
        state.totalElements += 1;
      })
      .addCase(createHandoverAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '인수인계 생성에 실패했습니다.';
      })

    // Update assignment
      .addCase(updateHandoverAssignment.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(
          item => item.assignmentId === action.payload.assignmentId
        );
        if (index !== -1) {
          state.assignments[index] = action.payload as HandoverAssignmentDto;
        }
        if (state.currentAssignment?.assignmentId === action.payload.assignmentId) {
          state.currentAssignment = action.payload as HandoverAssignmentDto;
        }
      })

    // Delete assignment
      .addCase(deleteHandoverAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter(
          item => item.assignmentId !== action.payload
        );
        state.totalElements -= 1;
        if (state.currentAssignment?.assignmentId === action.payload) {
          state.currentAssignment = null;
        }
      })

    // Start handover
      .addCase(startHandover.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(
          item => item.assignmentId === action.payload
        );
        if (index !== -1) {
          state.assignments[index].status = 'IN_PROGRESS';
        }
        if (state.currentAssignment?.assignmentId === action.payload) {
          state.currentAssignment.status = 'IN_PROGRESS';
        }
      })

    // Complete handover
      .addCase(completeHandover.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(
          item => item.assignmentId === action.payload
        );
        if (index !== -1) {
          state.assignments[index].status = 'COMPLETED';
        }
        if (state.currentAssignment?.assignmentId === action.payload) {
          state.currentAssignment.status = 'COMPLETED';
        }
      })

    // Cancel handover
      .addCase(cancelHandover.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(
          item => item.assignmentId === action.payload
        );
        if (index !== -1) {
          state.assignments[index].status = 'CANCELLED';
        }
        if (state.currentAssignment?.assignmentId === action.payload) {
          state.currentAssignment.status = 'CANCELLED';
        }
      })

    // Fetch statistics
      .addCase(fetchHandoverStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })

    // Handle special fetch cases (active, delayed, by employee, by position)
      .addCase(fetchActiveHandovers.fulfilled, (state, action) => {
        state.assignments = action.payload;
        state.totalElements = action.payload.length;
      })
      .addCase(fetchDelayedHandovers.fulfilled, (state, action) => {
        state.assignments = action.payload;
        state.totalElements = action.payload.length;
      })
      .addCase(fetchHandoversByEmployee.fulfilled, (state, action) => {
        state.assignments = action.payload;
        state.totalElements = action.payload.length;
      })
      .addCase(fetchHandoversByPosition.fulfilled, (state, action) => {
        state.assignments = action.payload;
        state.totalElements = action.payload.length;
      });
  }
});

export const {
  setSearchParams,
  setPaginationParams,
  clearCurrentAssignment,
  clearError,
  resetState
} = handoverSlice.actions;

export default handoverSlice.reducer;