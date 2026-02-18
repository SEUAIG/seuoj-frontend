import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import type { DateRange } from "react-day-picker";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/app/store";
import {
  setCurrent,
  setEndTime,
  setRuleType,
  setStartTime,
  setStatus,
  setTitleKeyword,
} from "@/features/ContestList/contestListSlice";
import { format, isValid, parseISO } from "date-fns";
import ProblemListPageChoose from "@/components/bussiness/ProblemListPageChoose";
import useQueryToGetContestList from "@/hooks/useQueryToGetContestList";
import ContestFilterPanel from "@/components/bussiness/ContestFilterPanel";
import ContestListTable from "@/components/bussiness/ContestListTable";
export default function CompetitionPage() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const {
    current,
    size,
    start_time,
    end_time,
    status,
    rule_type,
    title_keyword,
  } = useSelector((state: RootState) => state.contestList);
  const [range, setRange] = useState<DateRange | undefined>();
  const [startHour, setStartHour] = useState<string>("");
  const [startMinute, setStartMinute] = useState<string>("");
  const [endHour, setEndHour] = useState<string>("");
  const [endMinute, setEndMinute] = useState<string>("");
  const hourOptions = useMemo(
    () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")),
    []
  );
  const minuteOptions = useMemo(() => ["00", "15", "30", "45"], []);
  const statusOptions = useMemo(
    () => [
      "NOT_STARTED",
      "IN_PROGRESS",
      "PENDING_FINAL_PROCESSING",
      "TESTING",
      "FINISHED",
    ],
    []
  );
  const ruleTypeOptions = useMemo(() => ["NOI", "IOI", "ACM"], []);
  const statusLabelMap = new Map<string, string>([
    ["NOT_STARTED", "未开始"],
    ["IN_PROGRESS", "进行中"],
    ["PENDING_FINAL_PROCESSING", "等待结算"],
    ["TESTING", "测试中"],
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
      "PENDING_FINAL_PROCESSING",
      {
        selected:
          "bg-amber-500 hover:bg-amber-600 text-white border-transparent shadow-sm",
        idle: "hover:bg-amber-500 hover:text-white",
        outline:
          "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      },
    ],
    [
      "TESTING",
      {
        selected:
          "bg-purple-500 hover:bg-purple-600 text-white border-transparent shadow-sm",
        idle: "hover:bg-purple-500 hover:text-white",
        outline:
          "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
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
  const queryParams = useMemo(
    () => ({
      current: Number(current),
      size: Number(size),
      status: status ?? undefined,
      title_keyword: title_keyword ?? undefined,
      start_time: start_time ?? undefined,
      end_time: end_time ?? undefined,
      rule_type: rule_type ?? undefined,
    }),
    [current, size, status, title_keyword, start_time, end_time, rule_type]
  );
  const { data, refetch, isFetching, isLoading } = useQueryToGetContestList(
    queryParams,
    false
  );
  const records = data?.records ?? [];
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / Number(size));
  const handleSearch = () => {
    refetch();
  };
  const buildDateTime = (
    baseDate: Date | undefined,
    hours: string,
    minutes: string
  ) => {
    if (!baseDate || hours === "" || minutes === "") return null;
    const newDate = new Date(baseDate);
    newDate.setHours(Number(hours));
    newDate.setMinutes(Number(minutes));
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate.toISOString();
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
  useEffect(() => {
    const nextStart = buildDateTime(range?.from, startHour, startMinute);
    if (nextStart !== start_time) {
      dispatch(setStartTime(nextStart));
    }
  }, [dispatch, range?.from, startHour, startMinute, start_time]);
  useEffect(() => {
    const nextEnd = buildDateTime(range?.to, endHour, endMinute);
    if (nextEnd !== end_time) {
      dispatch(setEndTime(nextEnd));
    }
  }, [dispatch, range?.to, endHour, endMinute, end_time]);
  return (
    <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen overflow-x-hidden">
      <Helmet>
        <title>比赛 - SeuOJ</title>
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
          titleKeyword={title_keyword}
          onTitleChange={(value) =>
            dispatch(setTitleKeyword(value === "" ? null : value))
          }
          onTitleClear={() => dispatch(setTitleKeyword(null))}
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
          range={range}
          onRangeChange={setRange}
          hourOptions={hourOptions}
          minuteOptions={minuteOptions}
          startHour={startHour}
          startMinute={startMinute}
          endHour={endHour}
          endMinute={endMinute}
          onStartHourChange={setStartHour}
          onStartMinuteChange={setStartMinute}
          onEndHourChange={setEndHour}
          onEndMinuteChange={setEndMinute}
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
          </div>
          <ContestListTable
            records={records}
            isLoading={isLoading}
            isFetching={isFetching}
            formatContestTime={formatContestTime}
            statusLabelMap={statusLabelMap}
            getOutlineTagClass={getOutlineTagClass}
            onOpenContest={(contestPublicId) =>
              nav(`/competition/${contestPublicId}`)
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
