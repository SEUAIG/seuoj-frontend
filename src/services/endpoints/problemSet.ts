export const problemSetEndpoints = {
  create: "/api/problem_set",
  page: "/api/problem_set/page",
  byId: (problemSetId: number) => `/api/problem_set/${problemSetId}`,
  problemPage: (problemSetId: string) => `/api/problem_set/${problemSetId}/problem/page`,
  updateProblemList: (problemSetId: string) => `/api/problem_set/${problemSetId}/problem`,
};
