export const userEndpoints = {
  page: "/api/common/user/page",
  batchImport: "/api/common/user/batch-import",
  profileById: (userId: number) => `/api/user/profile/${userId}`,
  meProfile: "/api/user/me/profile",
  myHeatmap: "/api/me/heatmap",
};
