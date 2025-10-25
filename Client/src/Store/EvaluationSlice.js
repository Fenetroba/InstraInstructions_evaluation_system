import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../Lib/Axios';
import { toast } from 'sonner';



// Async thunks
export const fetchAllEvaluations = createAsyncThunk(
  'evaluations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/evaluation');
      return response.data;
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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch evaluation');
    }
  }
);

export const createEvaluation = createAsyncThunk(
  'evaluations/create',
  async (evaluationData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/evaluation', evaluationData);
      toast.success('Evaluation created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create evaluation');
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
  evaluations: [],
  evaluation: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  message: null,
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
        state.evaluations = action.payload.data || [];
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
        state.evaluation = action.payload.data;
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
        state.evaluations.push(action.payload.data);
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
        const index = state.evaluations.findIndex(
          
        );
        if (index !== -1) {
          state.evaluations[index] = action.payload.data;
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
        state.evaluations = state.evaluations.filter(
         
        );
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