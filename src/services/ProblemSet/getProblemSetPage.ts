import { api } from "../api/axios";

export type ProblemSetListQuery = {
    current?: number;
    size?: number;
};

export type ProblemSetRecord = {
    title?: string;
    description?: string;
    is_public?: boolean;
    problem_count?: number;
    problem_set_id?: number;
};

export type ProblemSetPageData = {
    current?: number;
    size?: number;
    total?: number;
    records?: ProblemSetRecord[];
};

export type ProblemSetPageResponse = {
    code: number;
    message: string;
    data?: ProblemSetPageData;
};

export const getProblemSetPage = async (
    params: ProblemSetListQuery
): Promise<ProblemSetPageData | undefined> => {
    const res = await api.get<ProblemSetPageResponse>("/api/problem_set/page", {
        params,
    });
    return res.data.data;
};
