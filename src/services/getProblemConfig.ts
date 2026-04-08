import { api } from "./api/axios";

/** 测试点 */
export interface Testcase {
  id: number;
  in_path: string;
  ans_path: string;
  weight?: number;
  time_limit_ms?: number | null;
  memory_limit_kb?: number | null;
}

/** 子任务 */
export interface Subtask {
  id: number;
  cases: number[];
  pre_subtasks?: number[];
  score: number;
  type: "min" | "sum";
}

export interface ProblemInfo {
  problem_type: "Standard" | "Interactive" | "Special";
  checker_type: "Standard" | "Special" | "Interactor";
  time_limit_ms?: number;
  memory_limit_kb?: number;
}

export interface CustomModules {
  checker_path?: string | null;
  interactor_path?: string | null;
}

export interface ProblemConfigData {
  problem_info: ProblemInfo;
  testcases: Testcase[];
  subtasks: Subtask;
  custom_modules?: CustomModules;
}

export interface ProblemConfigResponse {
  code: number;
  message: string;
  data: ProblemConfigData;
}

/**
 * 获取题目数据配置
 * 替代已废弃的 GET /api/problem/data/{pid}
 */
export async function getProblemConfig(pid: string): Promise<ProblemConfigData> {
  const res = await api.get<ProblemConfigResponse>(`/api/problem/config/${pid}`);
  const result = res.data;
  if (result.code !== 200 && result.code !== 0) {
    throw new Error(result.message || "获取题目配置失败");
  }
  return result.data;
}
