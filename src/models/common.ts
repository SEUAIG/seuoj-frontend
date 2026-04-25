export interface ApiResponseBase {
  code: number;
  message: string;
}

export type ApiResponse<T> = ApiResponseBase & {
  data: T;
};

export interface PageData<T> {
  current: number;
  size: number;
  total: number;
  records: T[];
}
