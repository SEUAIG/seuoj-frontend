import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const fortuneLevels = ["大吉", "中吉", "小吉", "平", "小凶"];

export const goodThings = [
  "先做一道简单题热手",
  "补昨天没做出来的题",
  "刷一道中等题找状态",
  "整理一道错题",
  "尝试一道你熟悉标签的题",
  "开局先读题三遍再下手",
  "给队友讲一道题",
  "阅读一篇优秀的题解",
];

export const badThings = [
  "一上来硬冲最难题",
  "没想清楚就直接开写",
  "和样例过不去一整晚",
  "反复提交同一个错误",
  "边刷题边刷短视频",
  "把 debug 当做算法训练",
  "在群里抱怨题目太难",
  "抄代码不求甚解",
];

export const messages = [
  "今日代码气运平稳，适合稳扎稳打。",
  "你离 AC 也许只差一个边界条件。",
  "今天适合先热身，再发力。",
  "别急，题目不会跑，数组下标会。",
  "也许今天最重要的不是速度，而是少写 bug。",
  "今日若能沉住气，提交记录会很好看。",
  "命运提示：先判特例，再写主体。",
  "今日算法之神路过，但只眷顾认真读题的人。",
  "键盘敲烂，月薪过万（划掉），AC 万岁！",
  "保持冷静，WA 只是 AC 的前奏。",
];

export const luckyTags = [
  "二分",
  "模拟",
  "双指针",
  "贪心",
  "DFS",
  "BFS",
  "前缀和",
  "枚举",
  "动态规划",
  "图论",
  "数论",
  "字符串",
];

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = 31 * hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDailySeed(username: string) {
  const today = getTodayString();
  return hashString(`${username}-${today}`);
}

// Simple seeded random generator
class Random {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280.0;
  }

  range(min: number, max: number) {
    return Math.floor(this.next() * (max - min) + min);
  }

  pick<T>(arr: T[]): T {
    return arr[this.range(0, arr.length)];
  }

  pickMultiple<T>(arr: T[], count: number): T[] {
    const result: T[] = [];
    const copy = [...arr];
    for (let i = 0; i < count; i++) {
      if (copy.length === 0) break;
      const idx = this.range(0, copy.length);
      result.push(copy[idx]);
      copy.splice(idx, 1);
    }
    return result;
  }
}

export default function Fortune() {
  const { user } = useSelector((state: RootState) => state.auth);
  const username = user?.username || "guest";

  const fortuneData = useMemo(() => {
    const seed = getDailySeed(username);
    const rng = new Random(seed);

    const level = rng.pick(fortuneLevels);
    const goods = rng.pickMultiple(goodThings, 1); // 减少为1个
    const bads = rng.pickMultiple(badThings, 1); // 减少为1个
    const message = rng.pick(messages);
    const tag = rng.pick(luckyTags);

    return { level, goods, bads, message, tag };
  }, [username]);

  const levelColor =
    {
      大吉: "text-red-600",
      中吉: "text-orange-600",
      小吉: "text-yellow-600",
      平: "text-blue-600",
      小凶: "text-gray-600",
    }[fortuneData.level] || "text-gray-600";

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold">今日运势</CardTitle>
          <span className="text-xs text-muted-foreground">
            {getTodayString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-row items-center justify-between gap-4">
          {/* 左侧：运势等级 */}
          <div className="text-center min-w-[60px]">
            <span
              className={cn("text-3xl font-black tracking-widest", levelColor)}
            >
              {fortuneData.level}
            </span>
          </div>

          {/* 右侧：宜忌 + 幸运标签 */}
          <div className="flex-1 flex flex-col gap-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-green-600 shrink-0">宜</span>
              <span className="text-muted-foreground truncate">
                {fortuneData.goods[0]}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-red-600 shrink-0">忌</span>
              <span className="text-muted-foreground truncate">
                {fortuneData.bads[0]}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-semibold text-muted-foreground shrink-0">
                幸运标签:
              </span>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] px-1 py-0 h-5"
              >
                {fortuneData.tag}
              </Badge>
            </div>
          </div>
        </div>

        {/* 底部：寄语 */}
        <div className="pt-2 border-t mt-3">
          <div className="text-xs text-muted-foreground italic text-center truncate">
            "{fortuneData.message}"
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
