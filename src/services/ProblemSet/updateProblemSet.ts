import { api } from "../api/axios";

export type UpdateProblemSetProblemItem = {
    pid: string;
    title: string;
    order_id: string;
};

export type UpdateProblemSetRequest = {
    title?: string;
    description?: string;
    is_public?: boolean;
    problem_list?: UpdateProblemSetProblemItem[];
};

export type UpdateProblemSetResponse = {
    code: number;
    message: string;
};

export const updateProblemSet = async (
    problemSetId: number,
    data: UpdateProblemSetRequest
): Promise<UpdateProblemSetResponse> => {
    const res = await api.put<UpdateProblemSetResponse>(
        `/api/problem_set/${problemSetId}`,
        data
    );
    return res.data;
};
