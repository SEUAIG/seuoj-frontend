import { getLanguages } from "@/services/Submission/getLanguages";
import { useQuery } from "@tanstack/react-query";

function useQueryToGetLanguages() {
  return useQuery({
    queryKey: ["getLanguages"],
    queryFn: getLanguages,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
}

export default useQueryToGetLanguages;