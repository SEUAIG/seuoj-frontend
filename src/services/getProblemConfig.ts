import { api } from "./api/axios";
import { problemEndpoints } from "@/services/endpoints";

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
  subtasks: Subtask[];
  custom_modules?: CustomModules;
}

export interface ProblemConfigResponse {
  code: number;
  message: string;
  data: ProblemConfigData;
}

export async function getProblemConfig(pid: string): Promise<ProblemConfigData> {
  const res = await api.get<ProblemConfigResponse>(problemEndpoints.config(pid));
  const result = res.data;
  if (result.code !== 200 && result.code !== 0) {
    throw new Error(result.message || "获取题目配置失败");
  }
  return result.data;
}

export interface ProblemConfigPayload {
  problem_info: {
    problem_type: "standard" | "interactive" | "special";
    checker_type: "standard" | "special" | "interactor";
    time_limit_ms?: number;
    memory_limit_kb?: number;
  };
  testcases: Testcase[];
  subtasks?: Subtask[];
  custom_modules?: CustomModules;
}

export interface TreeItem {
  name: string;
  children?: TreeItem[];
}

export async function updateProblemConfig(
  pid: string,
  payload: ProblemConfigPayload
): Promise<void> {
  const res = await api.put(problemEndpoints.config(pid), payload);
  const result = res.data;
  if (result.code !== undefined && result.code !== 0 && result.code !== 200) {
    throw new Error(result.message || "更新题目配置失败");
  }
}

export async function getProblemFileTree(pid: string): Promise<string[]> {
  const res = await api.get(problemEndpoints.tree(pid));
  const result = res.data;
  const tree: TreeItem[] = result?.data?.tree ?? result?.data ?? [];
  if (!Array.isArray(tree)) return [];

  const dataFolder = tree.find((item) => item.name === "data");
  if (!dataFolder?.children) return [];

  const files: string[] = [];
  const collectFiles = (items: TreeItem[], prefix = "") => {
    for (const item of items) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.children && item.children.length > 0) {
        collectFiles(item.children, path);
      } else {
        files.push(path);
      }
    }
  };
  collectFiles(dataFolder.children, "");
  return files;
}
