import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../Lib/Axios';

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        success: false,
        message: "Network error. Please try again.",
      });
    }
  }
);
// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/logout');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const profile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue("Profile failed");
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/auth/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);




const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = payload.user;
    });
    builder.addCase(loginUser.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, { payload }) => {
      state.loading = false;
      // Don't authenticate - just create the user without logging them in
      // This is for admin creating users, not self-registration
      state.error = null;
    });
    builder.addCase(register.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });

    // Profile
    builder.addCase(profile.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear any previous errors

      })
      builder.addCase(profile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // Assuming your API returns { user: {...} }
        state.isAuthenticated = true;
        state.error = null;
      })
     builder .addCase(profile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load profile";
      })
    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;