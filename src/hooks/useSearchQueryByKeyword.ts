import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SearchResult, search } from "@/services/search";
export function useSearchQueryByKeyword<T = unknown>(
  current: string | number,
  size: string | number,
  title?: string | null,
  tag_ids?: number[] | null
) {
  return useQuery<SearchResult<T>>({
    queryKey: ["search", current, size, title, tag_ids],
    queryFn: () => search<T>(current, size, title, tag_ids),
    enabled: false,
    placeholderData: keepPreviousData,
  });
}
