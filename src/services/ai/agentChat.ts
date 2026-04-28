import { handleUnauthorizedByStatus } from "@/services/api/authGuard";
export type AgentChatRole = "user" | "assistant";

export interface AgentChatMessage {
  id: string;
  role: AgentChatRole;
  content: string;
  createdAt: string;
  citations?: Array<{
    citation_number?: number;
    source_title?: string;
    snippet?: string;
    location?: string;
    source_type?: string;
  }>;
}

export interface AgentChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messages: AgentChatMessage[];
}

const RAG_ANSWER_TIMEOUT_MS = 300000;
const RAG_STREAM_ENDPOINT = "/agent/rag_answer_stream";

function normalizeRole(role: unknown): AgentChatRole {
  const value = String(role ?? "").toLowerCase();
  return value === "user" ? "user" : "assistant";
}

function mapMessage(raw: any): AgentChatMessage {
  return {
    id: String(raw?.id ?? `msg-${Date.now()}`),
    role: normalizeRole(raw?.role),
    content: String(raw?.content ?? ""),
    createdAt: String(raw?.timestamp ?? raw?.created_at ?? new Date().toISOString()),
    citations: Array.isArray(raw?.citations) ? raw.citations : [],
  };
}

function mapSession(raw: any): AgentChatSession {
  const messages = Array.isArray(raw?.messages) ? raw.messages.map(mapMessage) : [];
  return {
    id: String(raw?.session_id ?? raw?.id ?? ""),
    title: String(raw?.title ?? "新会话"),
    lastMessage: String(raw?.last_message ?? ""),
    updatedAt: String(raw?.updated_at ?? raw?.created_at ?? new Date().toISOString()),
    messages,
  };
}

function buildHeaders(jwt?: string) {
  const headers: Record<string, string> = {
  };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
}

function buildJsonHeaders(jwt?: string) {
  return {
    ...buildHeaders(jwt),
    "Content-Type": "application/json",
  };
}

export async function fetchAgentSessions(params: {
  userId: string;
  jwt?: string;
  page?: number;
  size?: number;
}) {
  const { userId, jwt, page = 1, size = 50 } = params;
  const query = new URLSearchParams({
    user_id: userId,
    page: String(page),
    page_size: String(size),
  });
  const response = await fetch(`/agent/api/rag/sessions/?${query.toString()}`, {
    headers: buildHeaders(jwt),
  });
  handleUnauthorizedByStatus(response.status);
  if (!response.ok) throw new Error(`获取会话失败（${response.status}）`);
  const data = await response.json();
  const rows = Array.isArray(data?.results) ? data.results : [];
  return rows.map(mapSession) as AgentChatSession[];
}

export async function fetchAgentSessionDetail(params: {
  sessionId: string;
  jwt?: string;
}) {
  const { sessionId, jwt } = params;
  const response = await fetch(`/agent/api/rag/sessions/${sessionId}/`, {
    headers: buildHeaders(jwt),
  });
  handleUnauthorizedByStatus(response.status);
  if (!response.ok) throw new Error(`获取会话详情失败（${response.status}）`);
  const data = await response.json();
  return mapSession(data);
}

export async function fetchAgentSessionMessages(params: {
  sessionId: string;
  jwt?: string;
}) {
  const { sessionId, jwt } = params;
  const response = await fetch(`/agent/api/rag/sessions/${sessionId}/messages/`, {
    headers: buildHeaders(jwt),
  });
  handleUnauthorizedByStatus(response.status);
  if (!response.ok) throw new Error(`获取会话消息失败（${response.status}）`);
  const data = await response.json();
  const rows = Array.isArray(data?.messages) ? data.messages : [];
  return rows.map(mapMessage) as AgentChatMessage[];
}

export async function updateAgentSessionTitle(params: {
  sessionId: string;
  title: string;
  jwt?: string;
}) {
  const { sessionId, title, jwt } = params;
  const response = await fetch(`/agent/api/rag/sessions/${sessionId}/`, {
    method: "PUT",
    headers: buildJsonHeaders(jwt),
    body: JSON.stringify({ title }),
  });
  handleUnauthorizedByStatus(response.status);
  if (!response.ok) throw new Error(`更新会话标题失败（${response.status}）`);
  const data = await response.json();
  return mapSession(data);
}

export async function deleteAgentSession(params: { sessionId: string; jwt?: string }) {
  const { sessionId, jwt } = params;
  const response = await fetch(`/agent/api/rag/sessions/${sessionId}/`, {
    method: "DELETE",
    headers: buildHeaders(jwt),
  });
  handleUnauthorizedByStatus(response.status);
  if (!response.ok) throw new Error(`删除会话失败（${response.status}）`);
}

export async function askAgent(params: {
  userId: string;
  query: string;
  jwt?: string;
  sessionId?: string;
  onContent?: (fullText: string, deltaText: string) => void;
}) {
  const { userId, query, jwt, sessionId, onContent } = params;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RAG_ANSWER_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(RAG_STREAM_ENDPOINT, {
      method: "POST",
      headers: buildJsonHeaders(jwt),
      body: JSON.stringify({
        query,
        user_id: String(userId),
        session_id: sessionId ?? null,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`请求超时（>${RAG_ANSWER_TIMEOUT_MS / 1000}s）`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
  handleUnauthorizedByStatus(response.status);
  if (!response.ok) throw new Error(`发送消息失败（${response.status}）`);
  if (!response.body) throw new Error("流式响应为空");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let citations: Array<{ citation_number: number; source_title: string }> = [];

  const consumeEventBlock = (eventBlock: string) => {
    const lines = eventBlock.split(/\r?\n/);
    const dataLines = lines
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart());
    if (dataLines.length === 0) return;
    const payload = dataLines.join("");
    if (!payload) return;

    let parsed: any;
    try {
      parsed = JSON.parse(payload);
    } catch {
      return;
    }

    if (parsed?.type === "content") {
      const deltaText = String(parsed?.text ?? "");
      if (!deltaText) return;
      content += deltaText;
      onContent?.(content, deltaText);
      return;
    }

    if (parsed?.type === "done") {
      const raw = Array.isArray(parsed?.citations) ? parsed.citations : [];
      citations = raw.map((item: unknown, index: number) => ({
        citation_number: index + 1,
        source_title: String(item ?? `参考 ${index + 1}`),
      }));
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const delimiterIndex = buffer.indexOf("\n\n");
      if (delimiterIndex < 0) break;
      const eventBlock = buffer.slice(0, delimiterIndex);
      buffer = buffer.slice(delimiterIndex + 2);
      consumeEventBlock(eventBlock);
    }
  }

  if (buffer.trim()) {
    consumeEventBlock(buffer);
  }

  const message: AgentChatMessage = {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
    citations,
  };

  return {
    message,
    sessionId: String(sessionId ?? ""),
  };
}
