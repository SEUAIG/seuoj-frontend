import { api } from "@/services/api/axios";

export interface BatchImportUserRow {
    username: string;
    nickname?: string;
    email: string;
    password?: string;
}

export interface BatchImportRequest {
    passwordMode: "assigned" | "random";
    sendEmail: boolean;
    users: BatchImportUserRow[];
}

export interface FailDetail {
    row: number;
    username: string;
    email: string;
    reason: string;
}

export interface BatchImportResult {
    totalCount: number;
    successCount: number;
    failCount: number;
    failures: FailDetail[];
}

export interface BatchImportResponse {
    code: number;
    message: string;
    data: BatchImportResult;
}

export const batchImportUsers = async (
    req: BatchImportRequest
): Promise<BatchImportResponse> => {
    const response = await api.post<BatchImportResponse>(
        "/api/common/user/batch-import",
        req
    );
    return response.data;
};
