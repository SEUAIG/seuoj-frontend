import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User, AuthState } from "./types";
const initialState: AuthState = {
  user: { id: "1", username: "liuyuxi", avatarUrl: "", role: "admin" },
  isAuthenticated: true,
  status: "idle",
  error: undefined,
};
export const login = createAsyncThunk("auth/login", async () => {});
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = undefined;
      //   用于注销用户
    },
  },
  extraReducers: (builder) => {},
});
export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;
