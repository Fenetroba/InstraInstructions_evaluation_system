import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../Lib/Axios';

// Async thunks
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/user`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchSingleUser = createAsyncThunk(
  'users/fetchOne',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/search-user/${userId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/user/edit-user/${userId}`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update user'
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (userId, { rejectWithValue }) => {
    try {
      await axios.delete(`/user/delete-user/${userId}`);
      return userId; // Return the deleted user's ID
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

const usersDataSlice = createSlice({
  name: 'usersData',
  initialState: {
    users: [],
    currentUser: null,
    isLoading:false,
    error: null,
  },
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all users
    builder.addCase(fetchAllUsers.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAllUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload;
    });
    builder.addCase(fetchAllUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch single user
    builder.addCase(fetchSingleUser.pending, (state) => {
            state.isLoading = true;

    });
    builder.addCase(fetchSingleUser.fulfilled, (state, action) => {
            state.isLoading = false;
      state.currentUser = action.payload;
    });
    builder.addCase(fetchSingleUser.rejected, (state, action) => {
        state.isLoading = false;
      state.error = action.payload;
    });

    // Update user
    builder.addCase(updateUser.fulfilled, (state, action) => {
      const index = state.users.findIndex(user => user._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      if (state.currentUser?._id === action.payload._id) {
        state.currentUser = action.payload;
      }
    });

    // Delete user
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.users = state.users.filter(user => user._id !== action.payload);
      if (state.currentUser?._id === action.payload) {
        state.currentUser = null;
      }
    });
  },
});


export const { clearCurrentUser } = usersDataSlice.actions;

export default usersDataSlice.reducer;