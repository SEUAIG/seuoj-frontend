import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User, AuthState } from "./types";
import { ENV } from "@/config/env";
interface LoginPayload {
  username: string;

  password: string;
}
interface SignupPayload {
  username: string;
  email: string;
  password: string;
}
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
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
      return thunkAPI.rejectWithValue(result.message || "http 请求失败");
      // http请求的失败
    }
    if (result.code !== 200) {
      return thunkAPI.rejectWithValue(result.message || "登录失败");
    }
    result.data = {...result.data,username}
    return result;
    // 异步函数的返回值fulfilled会作为action payload  rejected的error。message 会是reject with value
  }
);
export const signup = createAsyncThunk(
  "auth/signup",
  async ({ username, email, password }: SignupPayload, thunkAPI) => {
    const res = await fetch(`${ENV.API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    // TODO email 还未使用
    const result = await res.json();
    // 返回response 对象 记得解析为json
    if (!res.ok) {
      return thunkAPI.rejectWithValue("http 请求失败");
      // http请求的失败
    }
    if (result.code !== 200) {
      return thunkAPI.rejectWithValue("注册失败");
    }
    return result;
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
    setError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const { jwt,username} = action.payload.data;
        state.jwt = jwt;
        // 如果 state.user 为 null 则创建一个新的 User 对象
        if (!state.user) {
          state.user = {
            id: "1", 
            username: username,
            avatarUrl: "",
            role: "student",
          };
        } else {
          state.user.username = username;
        }

        // TODO 完善返回赋值 现在没有用户信息
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});
export const { resetAuth, setError } = authSlice.actions;
export default authSlice.reducer;
