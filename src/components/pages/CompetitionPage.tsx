import React, { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/app/store";
import {
  setCurrent,
  setRuleType,
  setStatus,
  setTitle,
  clear,
} from "@/features/ContestList/contestListSlice";
import { format, isValid, parseISO } from "date-fns";
import ProblemListPageChoose from "@/components/bussiness/ProblemListPageChoose";
import useQueryToGetContestList from "@/hooks/useQueryToGetContestList";
import ContestFilterPanel from "@/components/bussiness/ContestFilterPanel";
import ContestListTable from "@/components/bussiness/ContestListTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type {
  ContestListQuery,
  ContestRuleType,
  ContestStatus,
} from "@/models/contest";

export default function CompetitionPage() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const role = useSelector((state: RootState) => state.auth.user?.role ?? "guest");
  const isTeacherOrAbove = role === "teacher" || role === "admin" || role === "superadmin";
  const {
    current,
    size,
    status,
    rule_type,
    title,
  } = useSelector((state: RootState) => state.contestList);

  useEffect(() => {
    dispatch(clear());
    dispatch(setCurrent(1));
  }, [dispatch]);

  const statusOptions = useMemo(
    () => ["NOT_STARTED", "IN_PROGRESS", "FINISHED"],
    []
  );
  const ruleTypeOptions = useMemo(() => ["NOI", "IOI", "ACM"], []);
  const statusLabelMap = new Map<string, string>([
    ["NOT_STARTED", "未开始"],
    ["IN_PROGRESS", "进行中"],
    ["FINISHED", "已结束"],
  ]);
  const statusClassMap = new Map<
    string,
    { selected: string; idle: string; outline: string }
  >([
    [
      "NOT_STARTED",
      {
        selected:
          "bg-blue-500 hover:bg-blue-600 text-white border-transparent shadow-sm",
        idle: "hover:bg-blue-500 hover:text-white",
        outline: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      },
    ],
    [
      "IN_PROGRESS",
      {
        selected:
          "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-sm",
        idle: "hover:bg-emerald-500 hover:text-white",
        outline:
          "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      },
    ],
    [
      "FINISHED",
      {
        selected:
          "bg-slate-500 hover:bg-slate-600 text-white border-transparent shadow-sm",
        idle: "hover:bg-slate-500 hover:text-white",
        outline:
          "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
      },
    ],
  ]);
  const ruleTypeClassMap = new Map<
    string,
    { selected: string; idle: string; outline: string }
  >([
    [
      "NOI",
      {
        selected:
          "bg-blue-500 hover:bg-blue-600 text-white border-transparent shadow-sm",
        idle: "hover:bg-blue-500 hover:text-white",
        outline: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      },
    ],
    [
      "IOI",
      {
        selected:
          "bg-amber-500 hover:bg-amber-600 text-white border-transparent shadow-sm",
        idle: "hover:bg-amber-500 hover:text-white",
        outline:
          "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      },
    ],
    [
      "ACM",
      {
        selected:
          "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-sm",
        idle: "hover:bg-emerald-500 hover:text-white",
        outline:
          "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      },
    ],
  ]);
  const getTagClass = (key: string, isSelected: boolean) => {
    const map = statusClassMap.get(key) ?? ruleTypeClassMap.get(key);
    if (!map) return "";
    return isSelected ? map.selected : map.idle;
  };
  const getOutlineTagClass = (key: string) => {
    const map = statusClassMap.get(key) ?? ruleTypeClassMap.get(key);
    return map ? map.outline : "";
  };
  const queryParams = useMemo<ContestListQuery>(
    () => ({
      current: Number(current),
      size: Number(size),
      status: (status ?? undefined) as ContestStatus | undefined,
      title: title ?? undefined,
      rule_type: (rule_type ?? undefined) as ContestRuleType | undefined,
    }),
    [current, size, status, title, rule_type]
  );

  const { data, refetch, isFetching, isLoading } = useQueryToGetContestList(
    queryParams,
    true
  );
  const records = data?.records ?? [];
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / Number(size));
  const handleSearch = () => {
    refetch();
  };
  const formatContestTime = (start?: string, end?: string) => {
    const formatOne = (value?: string) => {
      if (!value) return "";
      const parsed = parseISO(value);
      if (!isValid(parsed)) return value;
      return format(parsed, "yyyy年MM月dd日 HH:mm");
    };
    const startText = formatOne(start);
    const endText = formatOne(end);
    if (startText && endText) {
      return `${startText} ~ ${endText}`;
    }
    return startText || endText || "-";
  };
  return (
    <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen overflow-x-hidden">
      <Helmet>
        <title>比赛 - SEUOJ</title>
      </Helmet>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">比赛</div>
          <div className="text-sm text-muted-foreground mt-1">
            按条件筛选并查看比赛信息
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <ContestFilterPanel
          titleKeyword={title}
          onTitleChange={(value) =>
            dispatch(setTitle(value === "" ? null : value))
          }
          onTitleClear={() => dispatch(setTitle(null))}
          statusOptions={statusOptions}
          status={status}
          statusLabelMap={statusLabelMap}
          ruleTypeOptions={ruleTypeOptions}
          ruleType={rule_type}
          onStatusToggle={(value) =>
            dispatch(setStatus(status === value ? null : value))
          }
          onRuleTypeToggle={(value) =>
            dispatch(setRuleType(rule_type === value ? null : value))
          }
          getTagClass={getTagClass}
          isFetching={isFetching}
          onSearch={handleSearch}
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              共计{" "}
              <span className="font-semibold text-foreground">{total}</span>{" "}
              条结果
            </div>
            {isTeacherOrAbove && (
            <Button
              onClick={() => nav("/contest/create")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              创建比赛
            </Button>
            )}
          </div>
          <ContestListTable
            records={records}
            isLoading={isLoading}
            isFetching={isFetching}
            formatContestTime={formatContestTime}
            statusLabelMap={statusLabelMap}
            getOutlineTagClass={getOutlineTagClass}
            onOpenContest={(contestId) =>
              nav(`/contest/${contestId}`)
            }
          />
          {!!pages && (
            <ProblemListPageChoose
              pages={pages}
              current={current}
              dispatch={dispatch}
              refetch={refetch}
              setCurrentAction={setCurrent}
            />
          )}
        </div>
      </div>
    </div>
  );
}
