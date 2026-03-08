import { api } from "../api/axios";

export type ProblemSetProblemEditItem = {
    pid: string;
    title: string;
    order_id: string;
};

export type UpdateProblemSetProblemListRequest = {
    problem_list: ProblemSetProblemEditItem[];
};

export type UpdateProblemSetProblemListResponse = {
    code: number;
    message: string;
};

export const updateProblemSetProblemList = async (
    problem_set_id: string,
    payload: UpdateProblemSetProblemListRequest
): Promise<UpdateProblemSetProblemListResponse> => {
    const res = await api.post<UpdateProblemSetProblemListResponse>(
        `/api/problem_set/${problem_set_id}/problem`,
        payload
    );
    return res.data;
};
