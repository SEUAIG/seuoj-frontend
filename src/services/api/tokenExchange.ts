import { api } from "./axios";
import { authEndpoints } from "@/services/endpoints";

export const tokenExchange = async () => {
  const res = await api.post(authEndpoints.tokenExchange);
  return res.data;
};
