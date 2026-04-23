import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User, AuthState } from "./types";
import { ENV } from "@/config/env";

let onLoginSuccess: (() => void) | null = null;
export const setOnLoginSuccess = (cb: () => void) => { onLoginSuccess = cb; };
interface LoginPayload {
  email: string;
  password: string;
}
interface SignupPayload {
  username: string;
  email: string;
  password: string;
  verification_id: string;
  code: string;
}
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: undefined,
  jwt: undefined,
};
const isSuccessCode = (code: number) => code === 0;
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: LoginPayload, thunkAPI) => {
    const res = await fetch(`${ENV.API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      // 要把参数序列化json发送出去
    });
    const result = await res.json();
    // 返回response 对象 记得解析为json 异步解析
    if (!res.ok) {
      return thunkAPI.rejectWithValue(result.message || "http 请求失败");
      // http请求的失败
    }
    if (!isSuccessCode(result.code)) {
      if (result.code === 401) {
        return thunkAPI.rejectWithValue("用户不存在或账号密码不匹配");
      }
      return thunkAPI.rejectWithValue("登录失败");
    }
    result.data = { ...result.data, email };
    return result;
    // 异步函数的返回值fulfilled会作为action payload  rejected的error。message 会是reject with value
  }
);
export const signup = createAsyncThunk(
  "auth/signup",
  async (
    { username, email, password, verification_id, code }: SignupPayload,
    thunkAPI
  ) => {
    const res = await fetch(`${ENV.API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        verification_id,
        code,
      }),
    });
    const result = await res.json();
    // 返回response 对象 记得解析为json
    if (!res.ok) {
      return thunkAPI.rejectWithValue("http 请求失败");
      // http请求的失败
    }
    if (!isSuccessCode(result.code)) {
      if (result.code === 409) {
        return thunkAPI.rejectWithValue("注册时用户名重复");
      }
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
      state.jwt = undefined;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setNickname(state, action) {
      if (state.user) {
        state.user.nickname = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const { jwt, username, nickname, role } = action.payload.data;
        state.jwt = jwt;
        state.user = {
          id: "1",
          username: username || "user",
          nickname: nickname || undefined,
          avatarUrl: "",
          role: role || "student",
        };
        state.isAuthenticated = true;
        onLoginSuccess?.();
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});
export const { resetAuth, setError, setNickname } = authSlice.actions;
export const authReducer = authSlice.reducer;
