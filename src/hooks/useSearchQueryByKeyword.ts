import {useQuery} from "@tanstack/react-query"
import {search} from '@/services/search'
export function useSearchQueryByKeyword(current, size, title, tag_ids) {
  return useQuery({
    queryKey: ["search", current, size, title, tag_ids],
    queryFn: () => search(current, size, title, tag_ids),
    enabled: false,
  });
}