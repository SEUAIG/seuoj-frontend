import { getTags } from "@/services/getTags";
import { useQuery } from "@tanstack/react-query";

function useQueryToGetTags() {
  return useQuery({
    queryKey: ["getTags"],
    queryFn: getTags,
    staleTime: 1000 * 60 * 10,
  });
}

export default useQueryToGetTags;
