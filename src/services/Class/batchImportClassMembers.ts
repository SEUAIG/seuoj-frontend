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

export interface RowResult {
    row: number;
    student_id: string;
    name: string;
    email?: string;
    password?: string;
    status: string;
    detail?: string;
}

export interface ClassBatchImportResult {
    total_count: number;
    success_count: number;
    skipped_count: number;
    fail_count: number;
    rows: RowResult[];
}

export interface ClassBatchImportResponse {
    code: number;
    message: string;
    data: ClassBatchImportResult;
}

export const batchImportClassMembers = async (
    classId: number,
    req: ClassBatchImportRequest
): Promise<ClassBatchImportResponse> => {
    const response = await api.post<ClassBatchImportResponse>(
        `/api/class/${classId}/batch-import`,
        req
    );
    return response.data;
};
