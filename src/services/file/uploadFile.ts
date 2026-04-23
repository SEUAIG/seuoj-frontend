import { api } from "../api/axios";

export interface FileUploadResult {
  path: string;
  name: string;
  size: number;
}

export interface FileUploadResponse {
  code: number;
  message: string;
  data: FileUploadResult;
}

export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/api/file/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getDownloadUrl = (filePath: string): string => {
  return `/api/file/download/${filePath}`;
};
