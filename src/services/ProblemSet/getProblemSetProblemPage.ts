import { api } from "../api/axios";

export type ProblemSetProblemPageQuery = {
    current?: number;
    size?: number;
};

export type ProblemSetProblemRecord = {
    pid: string;
    title: string;
    sort_order: string;
};

export type ProblemSetProblemPageData = {
    current?: number;
    size?: number;
    total?: number;
    records?: ProblemSetProblemRecord[];
};

export type ProblemSetProblemPageResponse = {
    code: number;
    message: string;
    data?: ProblemSetProblemPageData;
};

export const getProblemSetProblemPage = async (
    problem_set_id: string,
    params?: ProblemSetProblemPageQuery
): Promise<ProblemSetProblemPageData | undefined> => {
    const res = await api.get<ProblemSetProblemPageResponse>(
        `/api/problem_set/${problem_set_id}/problem/page`,
        { params }
    );
    return res.data.data;
};
