export const contestEndpoints = {
  create: "/api/contest",
  page: "/api/contest/page",
  byId: (contestId: number) => `/api/contest/${contestId}`,
  problemListInEdit: (contestId: number) => `/api/contest/${contestId}/problem/list`,
  standings: (contestId: number) => `/api/contest/${contestId}/standings`,
  submissionPage: (contestId: number) => `/api/contest/${contestId}/submission/page`,
  submissionById: (contestId: number, submissionNo: string) =>
    `/api/contest/${contestId}/submission/${submissionNo}`,
  submit: (contestId: number) => `/api/contest/${contestId}/submission`,
  updateProblemList: (contestId: number) => `/api/contest/${contestId}/problem`,
  register: "/api/contest/register",
  registerWithQuery: (contestId: number) => `/api/contest/register?contest_id=${contestId}`,
};
