import { store } from "@/app/store";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const RAG_ANSWER_TIMEOUT_MS = 300000;

function buildSseResponse(content: string) {
  const encoder = new TextEncoder();
  const payload = JSON.stringify({
    choices: [{ delta: { content } }],
  });
  const sseText = `data: ${payload}\n\ndata: [DONE]\n\n`;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(sseText));
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream; charset=utf-8" },
  });
}

export async function deepseekStream(messages: DeepSeekMessage[]) {
  const state = store.getState();
  const userId = state.auth.user?.id || "1";
  const jwt = state.auth.jwt;
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")?.content
    ?.trim();

  if (!latestUserMessage) {
    throw new Error("请求内容不能为空");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RAG_ANSWER_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch("/agent/api/rag/messages/rag_answer/", {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_id: userId,
        query: latestUserMessage,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    return response;
  }

  const data = await response.json();
  const answer =
    data?.content ??
    data?.answer ??
    data?.message?.content ??
    data?.message ??
    "";

  return buildSseResponse(String(answer));
}
