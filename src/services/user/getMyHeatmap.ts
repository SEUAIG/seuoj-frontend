import { api } from "@/services/api/axios";
import { HeatmapResponse } from "@/types/heatmap";

export const getMyHeatmap = async (year: string): Promise<HeatmapResponse> => {
  const response = await api.get<HeatmapResponse>(`/api/me/heatmap`, {
    params: { year },
  });
  return response.data;
};
