import axios from "axios";
import type {
  AgentCodeGenerationRequest,
  AgentCodeGenerationResponse,
  AgentCodeRunnerRequest,
  AgentCodingLanguage,
  AgentProblemDetailResponse,
  AgentProblemListResponse,
} from "@/types/agentCoding";
import { submissionEndpoints } from "@/services/endpoints";

const agentClient = axios.create({
  timeout: 180000,
  headers: {
    "Content-Type": "application/json",
  },
});

function mapLanguage(lang: AgentCodingLanguage): string {
  const mapping: Record<AgentCodingLanguage, string> = {
    cpp: "c++",
    python: "python",
    java: "java",
    go: "go",
    nodejs: "javascript",
  };
  return mapping[lang];
}

function mapSeuojLanguage(lang: AgentCodingLanguage): string {
  const mapping: Record<AgentCodingLanguage, string> = {
    cpp: "Cpp17",
    python: "Python3_12",
    java: "Java17",
    go: "Go1_22",
    nodejs: "Nodejs22",
  };
  return mapping[lang];
}

export const agentCodingApi = {
  async getProblemList(): Promise<AgentProblemListResponse> {
    const response = await agentClient.get("/agent/problem/list");
    return response.data;
  },

  async getProblemDetail(problemId: string): Promise<AgentProblemDetailResponse> {
    const response = await agentClient.get(`/agent/problem/detail/${problemId}`);
    return response.data;
  },

  async generateCode(
    problemDescription: string,
    userSolution: string,
    language: AgentCodingLanguage
  ): Promise<AgentCodeGenerationResponse | string> {
    const request: AgentCodeGenerationRequest = {
      problem_description: problemDescription,
      user_solution: userSolution,
      language: mapLanguage(language),
    };
    const response = await agentClient.post("/agent/code_generation", request);
    return response.data;
  },

  async runCode(
    pid: string,
    code: string,
    language: AgentCodingLanguage,
    testCases?: string[]
  ): Promise<any> {
    const request: AgentCodeRunnerRequest & { pid: string } = {
      pid,
      code,
      language: mapSeuojLanguage(language),
    };
    if (testCases && testCases.length > 0) {
      request.test_cases = testCases;
    }
    const response = await agentClient.post(submissionEndpoints.create, request);
    return response.data;
  },
};
