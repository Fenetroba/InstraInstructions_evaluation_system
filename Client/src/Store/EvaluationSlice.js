import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../Lib/Axios';
import { toast } from 'sonner';

// Initial state
const initialState = {
  evaluations: [],
  currentEvaluation: null,
  responses: [], 
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  submissionStatus: 'idle', // 'idle' | 'submitting' | 'succeeded' | 'failed'
  evaluation: null,
};

// Async thunks
export const fetchEvaluations = createAsyncThunk(
  'evaluations/fetchEvaluations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/evaluation');
      return response.data.data || response.data;
      
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch evaluations');
    }
  }
);

export const fetchEvaluationById = createAsyncThunk(
  'evaluations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/evaluation/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch evaluation');
    }
  }
);
export const fetchEvaluationByIdPeer = createAsyncThunk(
  'evaluations/fetchByIdPeer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/evaluation/peer-evaluation/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch evaluation');
    }
  }
);

export const createEvaluation = createAsyncThunk(
  'evaluations/createEvaluation',
  async (evaluationData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/evaluation', evaluationData);
      toast.success('Evaluation created successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create evaluation');
      return rejectWithValue(error.response?.data?.message || 'Failed to create evaluation');
    }
  }
);

export const updateEvaluation = createAsyncThunk(
  'evaluations/updateEvaluation',
  async ({ id, ...updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/evaluation/${id}`, updates);
      toast.success('Evaluation updated successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update evaluation');
      return rejectWithValue(error.response?.data?.message || 'Failed to update evaluation');
    }
  }
);

export const deleteEvaluation = createAsyncThunk(
  'evaluations/deleteEvaluation',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/evaluation/${id}`);
      toast.success('Evaluation deleted successfully!');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete evaluation');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete evaluation');
    }
  }
);

export const updateEvaluationStatus = createAsyncThunk(
  'evaluations/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/evaluation/${id}/status`, { status });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const submitEvaluationResponse = createAsyncThunk(
  'evaluations/submitResponse',
  async ({ id, responses, overallComment, courseCode }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/evaluation/${id}/responses`, {
        responses,
        overallComment,
        courseCode,
      });
      toast.success('Evaluation submitted successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data || 'Failed to submit evaluation');
      return rejectWithValue(error?.response?.data || 'Failed to submit evaluation');
    }
  }
);

export const fetchEvaluationsByStudent = createAsyncThunk(
  'evaluations/fetchByStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      // Remove the leading slash to prevent URL duplication
      const response = await axios.get(`/evaluation/student/${studentId}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch evaluations by student');
    }
  }
);

// Slice
const evaluationSlice = createSlice({
  name: 'evaluations',
  initialState,
  reducers: {
    resetSubmissionStatus: (state) => {
      state.submissionStatus = 'idle';
    },
    clearCurrentEvaluation: (state) => {
      state.currentEvaluation = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Evaluations
    builder
      .addCase(fetchEvaluations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvaluations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.evaluations = action.payload;
      })
      .addCase(fetchEvaluations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // Fetch Evaluation by ID
    builder
      .addCase(fetchEvaluationById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvaluationById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentEvaluation = action.payload;
        state.evaluation = action.payload;
        state.error = null;
      })
      .addCase(fetchEvaluationById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // Create Evaluation
    builder
      .addCase(createEvaluation.fulfilled, (state, action) => {
        state.evaluations.push(action.payload);
      });

    // Update Evaluation
    builder
      .addCase(updateEvaluation.fulfilled, (state, action) => {
        const index = state.evaluations.findIndex(
          (evalItem) => evalItem._id === action.payload._id
        );
        if (index !== -1) {
          state.evaluations[index] = action.payload;
        }
        if (state.currentEvaluation?._id === action.payload._id) {
          state.currentEvaluation = action.payload;
        }
      });

    // Delete Evaluation
    builder
      .addCase(deleteEvaluation.fulfilled, (state, action) => {
        state.evaluations = state.evaluations.filter(
          (evalItem) => evalItem._id !== action.payload
        );
      });

    // Fetch Evaluations by Student
    builder
      .addCase(fetchEvaluationsByStudent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvaluationsByStudent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.evaluations = action.payload;
      })
      .addCase(fetchEvaluationsByStudent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // Submit Response
    builder
      .addCase(submitEvaluationResponse.pending, (state) => {
        state.submissionStatus = 'submitting';
      })
      .addCase(submitEvaluationResponse.fulfilled, (state, action) => {
        state.submissionStatus = 'succeeded';
        state.responses.push(action.payload);
      })
      .addCase(submitEvaluationResponse.rejected, (state, action) => {
        state.submissionStatus = 'failed';
        state.error = action.payload;
      })
      
      // Update Evaluation Status
      .addCase(updateEvaluationStatus.fulfilled, (state, action) => {
        const index = state.evaluations.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.evaluations[index] = action.payload;
        }
        if (state.currentEvaluation?._id === action.payload._id) {
          state.currentEvaluation = action.payload;
        }
      });
  },
});

// Selectors
export const selectAllEvaluations = (state) => state.evaluations.evaluations;
export const selectCurrentEvaluation = (state) => state.evaluations.currentEvaluation;
export const selectEvaluationStatus = (state) => state.evaluations.status;
export const selectSubmissionStatus = (state) => state.evaluations.submissionStatus;
export const selectEvaluationError = (state) => state.evaluations.error;

// Export actions
export const { resetSubmissionStatus, clearCurrentEvaluation } = evaluationSlice.actions;

export default evaluationSlice.reducer;