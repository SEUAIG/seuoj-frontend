import { api } from "../api/axios";
import { fileEndpoints } from "@/services/endpoints";

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
  const response = await api.post(fileEndpoints.upload, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getDownloadUrl = (filePath: string, fileName?: string): string => {
  return fileEndpoints.download(filePath, fileName);
};

export const downloadFileWithAuth = async (filePath: string, fileName?: string) => {
  const response = await api.get(fileEndpoints.download(filePath, fileName), {
    responseType: "blob",
  });
  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  if (fileName) {
    link.download = fileName;
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
};
