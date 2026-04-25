import { api } from "@/services/api/axios";
import { authEndpoints } from "@/services/endpoints";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendCodeRequest,
  SendCodeResponse,
  SignupRequest,
  SignupResponse,
} from "@/models/auth";

export const loginRequest = async (payload: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>(authEndpoints.login, payload);
  return res.data;
};

export const signupRequest = async (payload: SignupRequest): Promise<SignupResponse> => {
  const res = await api.post<SignupResponse>(authEndpoints.register, payload);
  return res.data;
};

export const sendRegisterCode = async (payload: SendCodeRequest): Promise<SendCodeResponse> => {
  const res = await api.post<SendCodeResponse>(authEndpoints.registerSendCode, payload);
  return res.data;
};

export const sendResetPasswordCode = async (payload: SendCodeRequest): Promise<SendCodeResponse> => {
  const res = await api.post<SendCodeResponse>(authEndpoints.resetPasswordSendCode, payload);
  return res.data;
};

export const resetPassword = async (
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const res = await api.post<ResetPasswordResponse>(authEndpoints.resetPassword, payload);
  return res.data;
};

export const changePassword = async (
  payload: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const res = await api.post<ChangePasswordResponse>(authEndpoints.changePassword, payload);
  return res.data;
};
