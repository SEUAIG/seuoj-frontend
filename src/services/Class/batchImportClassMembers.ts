import { api } from "@/services/api/axios";

export interface StudentRow {
    student_id: string;
    name: string;
    password?: string;
}

export interface ClassBatchImportRequest {
    password_mode: "assigned" | "random";
    send_email: boolean;
    students: StudentRow[];
}

export interface SuccessDetail {
    row: number;
    student_id: string;
    name: string;
    email: string;
    password: string;
    existing_account: boolean;
}

export interface FailDetail {
    row: number;
    student_id: string;
    name: string;
    reason: string;
}

export interface ClassBatchImportResult {
    total_count: number;
    success_count: number;
    fail_count: number;
    successes: SuccessDetail[];
    failures: FailDetail[];
}

export interface ClassBatchImportResponse {
    code: number;
    message: string;
    data: ClassBatchImportResult;
}

export const batchImportClassMembers = async (
    classPublicId: string,
    req: ClassBatchImportRequest
): Promise<ClassBatchImportResponse> => {
    const response = await api.post<ClassBatchImportResponse>(
        `/api/class/${classPublicId}/batch-import`,
        req
    );
    return response.data;
};
