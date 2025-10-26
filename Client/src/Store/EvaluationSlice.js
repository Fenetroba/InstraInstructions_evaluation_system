import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../Lib/Axios';
import { toast } from 'sonner';

const API_URL = '/evaluation';

// Async thunks
export const fetchAllEvaluations = createAsyncThunk(
  'evaluations/fetchAll',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
      
      // API returns { success: true, data: { docs, totalDocs, ... } }
      const data = response.data.data || response.data;
      
      // Ensure we always return an array for docs
      const result = {
        docs: Array.isArray(data.docs) ? data.docs : data.docs || [],
        totalDocs: data.totalDocs || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 1
      };
      
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch evaluations');
    }
  }
);

export const fetchEvaluationById = createAsyncThunk(
  'evaluations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      // API returns { success: true, data: { ... } }
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch evaluation');
    }
  }
);

export const createEvaluation = createAsyncThunk(
  'evaluations/create',
  async (evaluationData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post('/evaluation', evaluationData);
      
      // After successful creation, fetch the latest evaluations
      await dispatch(fetchAllEvaluations()).unwrap();
      
      toast.success('Evaluation created successfully');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create evaluation');
    }
  }
);

export const updateEvaluation = createAsyncThunk(
  'evaluations/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData);
      toast.success('Evaluation updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update evaluation');
      return rejectWithValue(error.response?.data?.message || 'Failed to update evaluation');
    }
  }
);

export const deleteEvaluation = createAsyncThunk(
  'evaluations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success('Evaluation deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete evaluation');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete evaluation');
    }
  }
);

export const submitEvaluationResponse = createAsyncThunk(
  'evaluations/submitResponse',
  async ({ id, answers }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/responses`, { answers });
      toast.success('Response submitted successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit response');
      return rejectWithValue(error.response?.data?.message || 'Failed to submit response');
    }
  }
);

const initialState = {
  evaluations: {
    docs: [],  // Make sure this is initialized as an array
    totalDocs: 0,
    page: 1,
    totalPages: 1
  },
  evaluation: null, // Single evaluation details
  status: 'idle',
  error: null
};

const evaluationSlice = createSlice({
  name: 'evaluations',
  initialState,
  reducers: {
    resetEvaluationState: (state) => {
      state.status = 'idle';
      state.error = null;
      state.message = null;
    },
    clearCurrentEvaluation: (state) => {
      state.evaluation = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch All Evaluations
    builder
  .addCase(fetchAllEvaluations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllEvaluations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Ensure we're properly handling both array and paginated responses
        if (Array.isArray(action.payload)) {
          state.evaluations.docs = action.payload;
          state.evaluations.totalDocs = action.payload.length;
          state.evaluations.totalPages = 1;
        } else if (action.payload && typeof action.payload === 'object') {
          // Handle paginated response object
          state.evaluations.docs = action.payload.docs || [];
          state.evaluations.totalDocs = action.payload.totalDocs || 0;
          state.evaluations.page = action.payload.page || 1;
          state.evaluations.totalPages = action.payload.totalPages || 1;
        }
        state.error = null;
      })
      .addCase(fetchAllEvaluations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Evaluation By ID
      .addCase(fetchEvaluationById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvaluationById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.evaluation = action.payload;
        state.error = null;
      })
      .addCase(fetchEvaluationById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create Evaluation
      .addCase(createEvaluation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createEvaluation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Check if evaluations.docs exists and is an array before pushing
        if (!state.evaluations.docs) {
          state.evaluations.docs = [];
        }
        if (action.payload.data) {
          state.evaluations.docs.unshift(action.payload.data); // Add new evaluation at the beginning
          state.evaluations.totalDocs += 1;
        }
        state.message = 'Evaluation created successfully';
      })
      .addCase(createEvaluation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update Evaluation
      .addCase(updateEvaluation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateEvaluation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.evaluations.docs?.findIndex(
          (evaluation) => evaluation._id === action.payload.data._id
        );
        if (index !== -1 && state.evaluations.docs) {
          state.evaluations.docs[index] = action.payload.data;
        }
        state.message = 'Evaluation updated successfully';
      })
      .addCase(updateEvaluation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Delete Evaluation
      .addCase(deleteEvaluation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteEvaluation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.evaluations.docs) {
          state.evaluations.docs = state.evaluations.docs.filter(
            (evaluation) => evaluation._id !== action.payload
          );
          state.evaluations.totalDocs = Math.max(0, state.evaluations.totalDocs - 1);
        }
        state.message = 'Evaluation deleted successfully';
      })
      .addCase(deleteEvaluation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Submit Response
      .addCase(submitEvaluationResponse.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(submitEvaluationResponse.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the evaluation with the new response
        if (state.evaluation) {
          state.evaluation.responses = state.evaluation.responses || [];
          state.evaluation.responses.push(action.payload.data);
        }
        state.message = 'Response submitted successfully';
      })
      .addCase(submitEvaluationResponse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Export actions
export const { resetEvaluationState, clearCurrentEvaluation } = evaluationSlice.actions;

// Selectors


export default evaluationSlice.reducer;