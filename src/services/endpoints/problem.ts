export const problemEndpoints = {
  create: "/api/problem",
  page: "/api/problem/page",
  byPid: (pid: string) => `/api/problem/${pid}`,
  nextId: "/api/problem/next_id",
  edit: "/api/problem/edit",
  config: (pid: string) => `/api/problem/config/${pid}`,
  tree: (pid: string) => `/api/problem/tree/${pid}`,
  file: (pid: string, fileName: string) => `/api/problem/file/${pid}/${fileName}`,
  data: (pid: string) => `/api/problem/data/${pid}`,
  tags: "/api/problem/tag",
  statistics: (pid: string) => `/api/problem/${pid}/statistics`,
};
