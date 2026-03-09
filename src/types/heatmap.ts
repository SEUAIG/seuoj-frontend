export interface HeatmapDay {
  date: string;
  count: number;
}

export interface HeatmapSummary {
  total: number;
  active_days: number;
}

export interface HeatmapData {
  year: string;
  days: HeatmapDay[];
  summary: HeatmapSummary;
}

export interface HeatmapResponse {
  code: number;
  message: string;
  data: HeatmapData;
}
