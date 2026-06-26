import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null, // Token isn't strictly needed in state anymore since it's in a cookie, but we can keep the field if used elsewhere
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true // Add this so we don't redirect to login before checking auth on load
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      // action.payload could just be { user: ... }
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isCheckingAuth = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isCheckingAuth = false;
    },
    setCheckingAuth: (state, action) => {
      state.isCheckingAuth = action.payload;
    }
  }
});

export const { loginSuccess, logout, setCheckingAuth } = authSlice.actions;

export default authSlice.reducer;
