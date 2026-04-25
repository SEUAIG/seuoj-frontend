import { api } from "@/services/api/axios";
import { HeatmapResponse } from "@/types/heatmap";
import { userEndpoints } from "@/services/endpoints";

export const getMyHeatmap = async (year: string): Promise<HeatmapResponse> => {
  const response = await api.get<HeatmapResponse>(userEndpoints.myHeatmap, {
    params: { year },
  });
  return response.data;
};
