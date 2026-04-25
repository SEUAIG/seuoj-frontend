import { api } from "./api/axios";
import { authEndpoints } from "@/services/endpoints";

export default async function getVerificationCode(email: string) {
  const res = await api.post(authEndpoints.registerSendCode, { email });
  return res.data.data;
}
