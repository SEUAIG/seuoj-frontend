import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "./types";
import type { LoginData } from "@/models/auth";
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
const applyLogin = (state: AuthState, data: LoginData) => {
  const { jwt, username, nickname, role, id, capabilities } = data;
  const normalizedRole: User["role"] =
    role === "admin" || role === "superadmin" || role === "teacher" || role === "student" || role === "guest"
      ? role
      : "student";
  state.jwt = jwt;
  state.user = {
    id: String(id),
    capabilities,
    username: username || "user",
    nickname: nickname || undefined,
    avatarUrl: "",
    role: normalizedRole,
  };
  state.isAuthenticated = true;
  onLoginSuccess?.();
};
// axios 拦截器会把后端返回的 message 写进 error.message
const requestErrorMessage = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "message" in error &&
  typeof (error as { message?: unknown }).message === "string"
    ? (error as { message: string }).message
    : "http 请求失败";
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
      return thunkAPI.rejectWithValue(requestErrorMessage(error));
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
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(requestErrorMessage(error));
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
    setCurrentProfile(state, action) {
      if (state.user) {
        state.user.id = String(action.payload.id);
        state.user.username = action.payload.username;
        state.user.nickname = action.payload.nickname || undefined;
        if (action.payload.role) state.user.role = action.payload.role;
        if (action.payload.capabilities) state.user.capabilities = action.payload.capabilities;
      }
    },
    setNickname(state, action) {
      if (state.user) {
        state.user.nickname = action.payload;
      }
    },
    // 两步验证通过后由登录表单提交
    loginCompleted(state, action: PayloadAction<LoginData>) {
      applyLogin(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        // 还差两步验证时不登录，由登录表单接着走验证码步骤
        if (action.payload.data.mfa) return;
        applyLogin(state, action.payload.data);
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});
export const { resetAuth, setError, setNickname, setCurrentProfile, loginCompleted } = authSlice.actions;
export const authReducer = authSlice.reducer;
