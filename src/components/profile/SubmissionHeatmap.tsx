import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getMyHeatmap } from "@/services/user/getMyHeatmap";
import {
  fillHeatmapDays,
  getHeatmapColorClass,
  groupDaysByWeek,
} from "@/features/heatmap/utils";
import { HeatmapData } from "@/types/heatmap";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmissionHeatmapProps {
  year: number;
}

const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

export default function SubmissionHeatmap({ year }: SubmissionHeatmapProps) {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMyHeatmap(year.toString());
        if (response.code === 0) {
          setData(response.data);
        } else {
          setError(response.message || "获取热力图数据失败");
        }
      } catch (err) {
        console.error(err);
        setError("获取热力图数据失败");

        setData({
          year: year.toString(),
          days: [],
          summary: { total: 0, active_days: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  const { weeks, monthLabels } = useMemo(() => {
    const rawDays = data?.days || [];
    const fullDays = fillHeatmapDays(year.toString(), rawDays);
    const weeksData = groupDaysByWeek(fullDays);

    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeksData.forEach((week, index) => {
      const firstDay = week.find((d) => d !== null);
      if (firstDay) {
        const date = new Date(firstDay.date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({
            label: MONTHS[month],
            weekIndex: index,
          });
          lastMonth = month;
        }
      }
    });
    return { weeks: weeksData, monthLabels };
  }, [data, year]);

  if (loading && !data) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className="w-full border-destructive/50">
        <CardContent className="flex justify-center items-center h-40 text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }
  const CELL_SIZE = 12;
  const GAP_SIZE = 2;
  const COL_WIDTH = CELL_SIZE + GAP_SIZE;
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">
            {year} 提交记录
          </CardTitle>
          <div className="text-sm text-muted-foreground space-x-4">
            <span>
              总计{" "}
              <span className="font-medium text-foreground">
                {data?.summary?.total || 0}
              </span>
            </span>
            <span>
              活跃天数{" "}
              <span className="font-medium text-foreground">
                {data?.summary?.active_days || 0}
              </span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="flex flex-col gap-2 min-w-max">
            <div className="relative h-4 ml-8 text-xs text-muted-foreground">
              {monthLabels.map((item) => (
                <span
                  key={item.label}
                  className="absolute top-0 whitespace-nowrap"
                  style={{ left: `${item.weekIndex * COL_WIDTH}px` }}
                >
                  {item.label}
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <div className="flex flex-col gap-[2px] text-[10px] text-muted-foreground mr-2 pt-[1px]">
                <div className="h-3 leading-3">一</div>
                <div className="h-3 leading-3"></div>
                <div className="h-3 leading-3">三</div>
                <div className="h-3 leading-3"></div>
                <div className="h-3 leading-3">五</div>
                <div className="h-3 leading-3"></div>
                <div className="h-3 leading-3"></div>
              </div>
              <div className="flex gap-[2px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {week.map((day, dayIndex) => {
                      if (!day) {
                        return (
                          <div
                            key={dayIndex}
                            className="w-3 h-3 bg-transparent"
                          />
                        );
                      }
                      return (
                        <TooltipProvider key={day.date}>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-[2px] transition-colors border",
                                  getHeatmapColorClass(day.count),
                                  day.count === 0
                                    ? "border-border/60"
                                    : "border-transparent"
                                )}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs font-medium">
                                {day.date} 提交了 {day.count} 次
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>少</span>
          <div className="flex gap-[2px]">
            <div className="w-3 h-3 rounded-[2px] bg-muted/30 border border-border/60"></div>
            <div className="w-3 h-3 rounded-[2px] bg-emerald-200 dark:bg-emerald-900 border border-transparent"></div>
            <div className="w-3 h-3 rounded-[2px] bg-emerald-400 dark:bg-emerald-700 border border-transparent"></div>
            <div className="w-3 h-3 rounded-[2px] bg-emerald-600 dark:bg-emerald-500 border border-transparent"></div>
            <div className="w-3 h-3 rounded-[2px] bg-emerald-800 dark:bg-emerald-300 border border-transparent"></div>
          </div>
          <span>多</span>
        </div>
      </CardContent>
    </Card>
  );
}
