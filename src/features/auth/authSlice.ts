import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User, AuthState } from "./types";
import { ENV } from "@/config/env";
interface LoginPayload {
  username: string;
  password: string;
}
const initialState: AuthState = {
  user: { id: "1", username: "liuyuxi", avatarUrl: "", role: "admin" },
  isAuthenticated: true,
  status: "idle",
  error: undefined,
  jwt: undefined,
};
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }: LoginPayload, thunkAPI) => {
    const res = await fetch(`${ENV.API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      // 要把参数序列化json发送出去
    });
    const result = await res.json();
    // 返回response 对象 记得解析为json
    if (!res.ok) {
      return thunkAPI.rejectWithValue("http 请求失败");
      // http请求的失败
    }
    if (result.code !== 200) {
      return thunkAPI.rejectWithValue("登录失败");
    }
    return result;
    // 异步函数的返回值fulfilled会作为action payload  rejected的error。message 会是reject with value
  }
);
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
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const { jwt } = action.payload.data;
        state.jwt = jwt;
        // TODO 完善返回赋值 现在没有用户信息
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.error =  action.payload as string ;
      });
  },
});
export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;
