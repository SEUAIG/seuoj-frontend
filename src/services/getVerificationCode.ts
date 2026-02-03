import { api } from "./api/axios";

export default async function getVerificationCode(email: string) {
    const res = await api.post("/api/auth/register/send-code",{email:email});
    return res.data.data;
}