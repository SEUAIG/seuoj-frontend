import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  GetUserPageRequest,
  UserPageData,
  getUserPage,
} from "@/services/user/getUserPage";

export default function useQueryToGetUserPage(
  params: GetUserPageRequest,
  enabled: boolean
) {
  return useQuery<UserPageData>({
    queryKey: ["commonUserPage", params],
    queryFn: async () => {
      const result = await getUserPage(params);
      if (result.code !== 0 && result.code !== 200) {
        throw new Error(result.message || "加载用户列表失败");
      }
      return result.data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}
