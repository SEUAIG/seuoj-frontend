import { api } from "./api/axios";
export type SearchResult<T = unknown> = {
  records: T[];
  total: number;
  current?: number;
  size?: number;
};
export async function search<T = unknown>(
  current: string | number,
  size: string | number,
  title?: string | null,
  tag_ids?: number[] | null
): Promise<SearchResult<T>> {
  const res = await api.get("/api/problem/page", {
    params: { current, size, title, tag_ids },
  });
  return res.data.data as SearchResult<T>;
}
