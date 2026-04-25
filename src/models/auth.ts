import type { ApiResponse, ApiResponseBase } from "@/models/common";

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginData {
  jwt: string;
  username: string;
  nickname?: string;
  role?: string;
}

export type LoginResponse = ApiResponse<LoginData>;

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  verification_id: string;
  code: string;
}

export type SignupResponse = ApiResponseBase;

export interface SendCodeRequest {
  email: string;
}

export interface SendCodeData {
  expire_in: number;
  next_send_in: number;
  verification_id: string;
}

export type SendCodeResponse = ApiResponse<SendCodeData>;

export interface ResetPasswordRequest {
  email: string;
  verification_id: string;
  code: string;
  new_password: string;
}

export type ResetPasswordResponse = ApiResponseBase;

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export type ChangePasswordResponse = ApiResponseBase;
