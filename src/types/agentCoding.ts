export type AgentCodingLanguage = "cpp" | "python" | "java" | "go" | "nodejs";

export interface AgentProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface AgentProblem {
  id: number;
  title: string;
  description: string;
  type?: string;
  tags?: string[];
  examples?: AgentProblemExample[];
  constraints?: string[];
  template_code?: Record<string, string>;
  hints?: string[];
}

export interface AgentProblemListResponse {
  total?: number;
  problems: AgentProblem[];
}

export interface AgentProblemDetailResponse {
  status?: string;
  message?: string;
  problem: AgentProblem;
}

export interface AgentCodeGenerationRequest {
  problem_description: string;
  user_solution: string;
  language: string;
}

export interface AgentCodeRunnerRequest {
  code: string;
  language: string;
  test_cases?: string[];
}

export interface AgentCodeGenerationResponse {
  code?: string;
  stdin_code?: string;
  suggestion?: string;
  solution_understanding?: string;
  test_cases?: string[];
  [key: string]: unknown;
}
