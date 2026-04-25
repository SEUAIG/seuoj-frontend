export const submissionEndpoints = {
  page: "/api/submission/page",
  byNo: (submissionNo: string) => `/api/submission/${submissionNo}`,
  create: "/api/submission",
};
