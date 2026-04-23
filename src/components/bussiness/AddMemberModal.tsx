import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, UserPlus } from "lucide-react";
import useQueryToGetUserPage from "@/hooks/useQueryToGetUserPage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addMember } from "@/services/Class/addMember";
import ClassPagination from "./ClassPagination";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  classId,
}: AddMemberModalProps) {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [page, setPage] = useState(1);
  const size = 5;

  const { data, isLoading, isFetching } = useQueryToGetUserPage(
    {
      current: page,
      size,
      username: searchUsername || undefined,
    },
    isOpen
  );

  const records = data?.records || [];
  const totalPages = Math.ceil((data?.total || 0) / size);

  const addMutation = useMutation({
    mutationFn: (userId: number) => addMember(classId, userId),
    onSuccess: (res) => {
      if (res.code === 0) {
        toast.success("成功添加成员");
        queryClient.invalidateQueries({
          queryKey: ["classMemberPage", classId],
        });
        onClose();
      } else {
        toast.error(res.message || "添加失败");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "添加请求发生错误");
    },
  });

  const handleSearch = () => {
    setSearchUsername(keyword);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>添加班级成员</DialogTitle>
          <DialogDescription>
            搜索用户并将其添加到班级中。
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mt-2">
          <Input
            placeholder="搜索用户名..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 min-h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              未找到用户
            </div>
          ) : (
            <div
              className={`space-y-2 ${
                isFetching ? "opacity-60 transition-opacity" : ""
              }`}
            >
              {records.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{user.nickname || user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addMutation.mutate(user.user_id)}
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        添加
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center pt-2">
            <ClassPagination
              totalPages={totalPages}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
