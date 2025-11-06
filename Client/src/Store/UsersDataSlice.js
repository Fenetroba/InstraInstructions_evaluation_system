import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../Lib/Axios';

// Async thunks
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/user`);
      return response.data.data || response.data;
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
      return response.data.data || response.data;
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
// Add this in UsersDataSlice.js
export const updateUserPassword = createAsyncThunk(
  'users/updatePassword',
  async ({ userId, currentPassword, newPassword }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.put(`/auth/update-password/${userId}`, {
        currentPassword,
        newPassword
      });

      // If we get a new token, we might want to update it in the auth state
      if (response.data.token) {
        // Store the new token in local storage
        localStorage.setItem('token', response.data.token);
        // You might want to update your auth state here if needed
      }

      return response.data;
    } catch (error) {
      console.error('Password update error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update password. Please try again.'
      );
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
    // Add this in the extraReducers builder in UsersDataSlice.js
builder.addCase(updateUserPassword.pending, (state) => {
  state.isLoading = true;
  state.error = null;
});
builder.addCase(updateUserPassword.fulfilled, (state) => {
  state.isLoading = false;
  state.error = null;
  // Optionally show success message
});
builder.addCase(updateUserPassword.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
});
  },
});


export const { clearCurrentUser } = usersDataSlice.actions;

export default usersDataSlice.reducer;