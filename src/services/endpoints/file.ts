export const fileEndpoints = {
  upload: "/api/file/upload",
  download: (filePath: string, name?: string) => {
    const base = `/api/file/download/${filePath}`;
    if (!name) return base;
    return `${base}?name=${encodeURIComponent(name)}`;
  },
};
