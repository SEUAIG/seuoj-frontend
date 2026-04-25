import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User, AuthState } from "./types";
import { loginRequest, signupRequest } from "@/services/auth";

let onLoginSuccess: (() => void) | null = null;
export const setOnLoginSuccess = (cb: () => void) => { onLoginSuccess = cb; };
interface LoginPayload {
  identifier: string;
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
  async ({ identifier, password }: LoginPayload, thunkAPI) => {
    try {
      const result = await loginRequest({ identifier, password });
      if (!isSuccessCode(result.code)) {
        if (result.code === 401) {
          return thunkAPI.rejectWithValue("用户不存在或账号密码不匹配");
        }
        return thunkAPI.rejectWithValue("登录失败");
      }
      return result;
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "http 请求失败";
      return thunkAPI.rejectWithValue(message);
    }
    // 异步函数的返回值fulfilled会作为action payload  rejected的error。message 会是reject with value
  }
);
export const signup = createAsyncThunk(
  "auth/signup",
  async (
    { username, email, password, verification_id, code }: SignupPayload,
    thunkAPI
  ) => {
    try {
      const result = await signupRequest({
        username,
        email,
        password,
        verification_id,
        code,
      });
      if (!isSuccessCode(result.code)) {
        if (result.code === 409) {
          return thunkAPI.rejectWithValue("注册时用户名重复");
        }
        return thunkAPI.rejectWithValue("注册失败");
      }
      return result;
    } catch {
      return thunkAPI.rejectWithValue("http 请求失败");
    }
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
        const normalizedRole: User["role"] =
          role === "admin" || role === "superadmin" || role === "teacher" || role === "student" || role === "guest"
            ? role
            : "student";
        state.jwt = jwt;
        state.user = {
          id: "1",
          username: username || "user",
          nickname: nickname || undefined,
          avatarUrl: "",
          role: normalizedRole,
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
