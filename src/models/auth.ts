import type { Capability } from "@/lib/capabilities";
import type { ApiResponse, ApiResponseBase } from "@/models/common";

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginData {
  id: number;
  capabilities: Capability[];
  jwt: string;
  username: string;
  nickname?: string;
  role?: string;
  /** 非空表示还差两步验证：verify 输入动态码，setup 先绑定验证器；此时 jwt 为空 */
  mfa?: "verify" | "setup" | null;
  mfaToken?: string | null;
  /** 刚绑定验证器时返回的一次性恢复码 */
  recoveryCodes?: string[] | null;
}

export type LoginResponse = ApiResponse<LoginData>;

export interface MfaCodeRequest {
  mfaToken: string;
  code: string;
}

export interface MfaSetupData {
  secret: string;
  otpauthUri: string;
}

export type MfaSetupResponse = ApiResponse<MfaSetupData>;

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
