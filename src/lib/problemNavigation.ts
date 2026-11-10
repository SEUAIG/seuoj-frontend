import type { ProblemDetailQuery } from "@/models/problem";

export function problemContext(params: URLSearchParams): ProblemDetailQuery {
  return {
    assignment_id: params.get("assignment_id") ?? undefined,
    problem_set_id: params.get("problem_set_id") ?? undefined,
    contest_id: params.get("contest_id") ?? undefined,
  };
}

export function problemPath(pid: string, context: ProblemDetailQuery, from: string): string {
  const params = new URLSearchParams({ from });
  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined) params.set(key, value);
  }
  return `/problemsLibrary/${pid}?${params}`;
}
