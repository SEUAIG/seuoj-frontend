export type AgentChatRole = "user" | "assistant";

export interface AgentChatMessage {
  id: string;
  role: AgentChatRole;
  content: string;
  createdAt: string;
}

export interface AgentChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messages: AgentChatMessage[];
}

const RAG_ANSWER_TIMEOUT_MS = 300000;

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
    "Content-Type": "application/json",
  };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
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
  if (!response.ok) throw new Error(`获取会话详情失败（${response.status}）`);
  const data = await response.json();
  return mapSession(data);
}

export async function askAgent(params: {
  userId: string;
  query: string;
  jwt?: string;
  sessionId?: string;
}) {
  const { userId, query, jwt, sessionId } = params;
  const body: Record<string, string> = {
    user_id: userId,
    query,
  };
  if (sessionId) body.session_id = sessionId;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RAG_ANSWER_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch("/agent/api/rag/messages/rag_answer/", {
      method: "POST",
      headers: buildHeaders(jwt),
      body: JSON.stringify(body),
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
  if (!response.ok) throw new Error(`发送消息失败（${response.status}）`);

  const data = await response.json();
  const rawMessage = data?.message ?? data;
  const message = mapMessage(rawMessage);
  const returnedSessionId =
    response.headers.get("x-session-id") ??
    response.headers.get("X-Session-Id") ??
    data?.session_id ??
    rawMessage?.session_id ??
    sessionId ??
    "";

  return {
    message,
    sessionId: String(returnedSessionId),
  };
}
