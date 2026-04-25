import { api } from "@/services/api/axios";
import { imageEndpoints } from "@/services/endpoints";

export interface ImageUploadData {
  imageKey: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface ImageUploadResponse {
  code: number;
  message: string;
  data: ImageUploadData;
}

export const uploadImage = async (file: File): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(imageEndpoints.upload, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};