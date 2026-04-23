import { api } from "@/services/api/axios";

export interface UpdateProfileRequest {
    nickname?: string;
}

export interface UserMeResponse {
    id: number;
    username: string;
    nickname: string | null;
    email: string;
}

export const updateProfile = async (req: UpdateProfileRequest) => {
    const response = await api.put<{
        code: number;
        message: string;
        data: UserMeResponse;
    }>("/api/user/me/profile", req);
    return response.data;
};
