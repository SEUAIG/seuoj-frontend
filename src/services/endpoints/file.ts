export const fileEndpoints = {
  upload: "/api/file/upload",
  download: (filePath: string) => `/api/file/download/${filePath}`,
};
