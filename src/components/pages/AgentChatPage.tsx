import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { RootState } from "@/app/store";
import {
  AgentChatMessage,
  AgentChatSession,
  askAgent,
  deleteAgentSession,
  fetchAgentSessionDetail,
  fetchAgentSessionMessages,
  fetchAgentSessions,
  updateAgentSessionTitle,
} from "@/services/ai/agentChat";
import { Pencil, Plus, SendHorizontal, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface CitationItem {
  number: number;
  title: string;
  snippet: string;
  location?: string;
  sourceType?: string;
}

const QUICK_QUESTIONS = [
  "如何把 DP 转移从 O(n^2) 优化到 O(n log n)？",
  "最短路问题里该如何在 BFS、Dijkstra 和 A* 之间做选择？",
  "能用一个实战模板讲清楚单调栈吗？",
  "贪心证明的边界用例应该如何设计？",
];

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractCitations(content: string): CitationItem[] {
  const matches = [...content.matchAll(/\[(\d+)\]/g)];
  const uniqueNumbers = [...new Set(matches.map((item) => Number(item[1])))].sort(
    (a, b) => a - b
  );
  return uniqueNumbers.map((number) => ({
    number,
    title: `参考 ${number}`,
    snippet: content.slice(0, 320),
  }));
}

function mapMessageCitations(message: AgentChatMessage): CitationItem[] {
  const fromApi = (message.citations ?? [])
    .map((item, index) => {
      const number = Number(item.citation_number ?? index + 1);
      return {
        number,
        title: String(item.source_title ?? `参考 ${number}`),
        snippet: String(item.snippet ?? ""),
        location: item.location ? String(item.location) : undefined,
        sourceType: item.source_type ? String(item.source_type) : undefined,
      };
    })
    .sort((a, b) => a.number - b.number);
  if (fromApi.length > 0) return fromApi;
  return extractCitations(message.content);
}

function upsertSessionList(
  sessions: AgentChatSession[],
  target: AgentChatSession
): AgentChatSession[] {
  const filtered = sessions.filter((item) => item.id !== target.id);
  return [target, ...filtered];
}

export default function AgentChatPage() {
  const { isAuthenticated, user, jwt } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  const [sessions, setSessions] = useState<AgentChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sending, setSending] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300);
  const [resizingSide, setResizingSide] = useState<"left" | null>(null);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(0);
  const loadedSessionIdsRef = useRef<Set<string>>(new Set());

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentSession = useMemo(
    () => sessions.find((session) => session.id === currentSessionId) ?? null,
    [sessions, currentSessionId]
  );
  const currentMessages = currentSession?.messages ?? [];

  useEffect(() => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [currentMessages.length, sending]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!resizingSide) return;
      const delta = event.clientX - resizeStartXRef.current;
      const nextWidth = Math.max(220, Math.min(520, resizeStartWidthRef.current + delta));
      setLeftSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setResizingSide(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingSide]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setSessions([]);
      setCurrentSessionId(null);
      return;
    }

    let alive = true;
    setLoadingSessions(true);
    fetchAgentSessions({ userId, jwt })
      .then(async (list) => {
        if (!alive) return;
        setSessions(list);
        const firstId = list[0]?.id ?? null;
        setCurrentSessionId((prev) => prev ?? firstId);
        if (firstId && !loadedSessionIdsRef.current.has(firstId)) {
          try {
            const [detail, messages] = await Promise.all([
              fetchAgentSessionDetail({ sessionId: firstId, jwt }),
              fetchAgentSessionMessages({ sessionId: firstId, jwt }),
            ]);
            if (!alive) return;
            loadedSessionIdsRef.current.add(firstId);
            setSessions((previous) =>
              upsertSessionList(previous, {
                ...detail,
                messages,
              })
            );
          } catch {
            // ignore background preload errors
          }
        }
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "获取会话失败");
      })
      .finally(() => {
        if (alive) setLoadingSessions(false);
      });

    return () => {
      alive = false;
    };
  }, [isAuthenticated, userId, jwt]);

  function startResize(side: "left", event: React.MouseEvent<HTMLDivElement>) {
    setResizingSide(side);
    resizeStartXRef.current = event.clientX;
    resizeStartWidthRef.current = leftSidebarWidth;
  }

  function autoResizeTextarea() {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
  }

  function createNewChat() {
    const tempId = createId("temp-session");
    const newSession: AgentChatSession = {
      id: tempId,
      title: "新会话",
      lastMessage: "",
      updatedAt: nowIso(),
      messages: [],
    };
    setSessions((previous) => [newSession, ...previous.filter((item) => !item.id.startsWith("temp-session"))]);
    setCurrentSessionId(newSession.id);
  }

  async function handleSelectSession(sessionId: string) {
    setCurrentSessionId(sessionId);

    if (sessionId.startsWith("temp-session")) return;
    if (loadedSessionIdsRef.current.has(sessionId)) return;
    try {
      const [detail, messages] = await Promise.all([
        fetchAgentSessionDetail({ sessionId, jwt }),
        fetchAgentSessionMessages({ sessionId, jwt }),
      ]);
      loadedSessionIdsRef.current.add(sessionId);
      setSessions((previous) =>
        upsertSessionList(previous, {
          ...detail,
          messages,
        })
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取会话详情失败");
    }
  }

  async function handleRenameSession(sessionId: string, oldTitle: string) {
    const title = window.prompt("请输入新的会话标题", oldTitle)?.trim();
    if (!title || title === oldTitle) return;
    try {
      const updated = await updateAgentSessionTitle({ sessionId, title, jwt });
      setSessions((previous) =>
        previous.map((session) =>
          session.id === sessionId ? { ...session, title: updated.title } : session
        )
      );
      toast.success("会话标题已更新");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新会话标题失败");
    }
  }

  async function handleDeleteSession(sessionId: string) {
    const ok = window.confirm("确认删除该会话？删除后不可恢复。");
    if (!ok) return;
    try {
      await deleteAgentSession({ sessionId, jwt });
      loadedSessionIdsRef.current.delete(sessionId);
      const remaining = sessions.filter((session) => session.id !== sessionId);
      setSessions(remaining);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(remaining[0]?.id ?? null);
      }
      toast.success("会话已删除");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除会话失败");
    }
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    if (!isAuthenticated || !userId) {
      toast.error("请先登录后再发送消息");
      return;
    }

    let targetSessionId = currentSessionId;
    if (!targetSessionId) {
      const tempId = createId("temp-session");
      const created: AgentChatSession = {
        id: tempId,
        title: trimmed.slice(0, 40) || "新会话",
        lastMessage: "",
        updatedAt: nowIso(),
        messages: [],
      };
      setSessions((previous) => [created, ...previous]);
      setCurrentSessionId(created.id);
      targetSessionId = created.id;
    }

    if (!targetSessionId) return;

    const userMessage: AgentChatMessage = {
      id: createId("msg"),
      role: "user",
      content: trimmed,
      createdAt: nowIso(),
    };
    const assistantMessageId = createId("msg");
    const assistantPlaceholder: AgentChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: nowIso(),
      citations: [],
    };

    setInput("");
    autoResizeTextarea();
    setSending(true);

    setSessions((previous) =>
      previous.map((session) =>
        session.id === targetSessionId
          ? {
              ...session,
              title: session.messages.length === 0 ? trimmed.slice(0, 40) : session.title,
              lastMessage: trimmed,
              updatedAt: nowIso(),
              messages: [...session.messages, userMessage, assistantPlaceholder],
            }
          : session
      )
    );

    try {
      const isTempSession = targetSessionId.startsWith("temp-session");
      const { message, sessionId: returnedSessionId } = await askAgent({
        userId,
        query: trimmed,
        jwt,
        sessionId: isTempSession ? undefined : targetSessionId,
        onContent: (fullText) => {
          setSessions((previous) =>
            previous.map((session) =>
              session.id === targetSessionId
                ? {
                    ...session,
                    lastMessage: fullText || session.lastMessage,
                    updatedAt: nowIso(),
                    messages: session.messages.map((item) =>
                      item.id === assistantMessageId
                        ? { ...item, content: fullText }
                        : item
                    ),
                  }
                : session
            )
          );
        },
      });

      const finalSessionId = returnedSessionId || targetSessionId;
      loadedSessionIdsRef.current.add(finalSessionId);
      setCurrentSessionId(finalSessionId);
      setSessions((previous) => {
        const base = previous.filter((item) => item.id !== targetSessionId);
        const old = previous.find((item) => item.id === targetSessionId);
        const oldMessages = old?.messages ?? [userMessage, assistantPlaceholder];
        const next: AgentChatSession = {
          id: finalSessionId,
          title: old?.title || trimmed.slice(0, 40) || "新会话",
          lastMessage: message.content,
          updatedAt: nowIso(),
          messages: oldMessages.map((item) =>
            item.id === assistantMessageId
              ? {
                  ...item,
                  content: message.content,
                  citations: message.citations ?? [],
                  createdAt: message.createdAt,
                }
              : item
          ),
        };
        return [next, ...base.filter((item) => item.id !== finalSessionId)];
      });
    } catch (error) {
      const fallback = "助手服务暂时不可用。";
      setSessions((previous) =>
        previous.map((session) =>
          session.id === targetSessionId
            ? {
                ...session,
                lastMessage: fallback,
                updatedAt: nowIso(),
                messages: session.messages.map((item) =>
                  item.id === assistantMessageId
                    ? {
                        ...item,
                        content: fallback,
                      }
                    : item
                ),
              }
            : session
        )
      );
      toast.error(error instanceof Error ? error.message : "消息发送失败");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 w-full bg-background">
      <Helmet>
        <title>智能体对话 - SeuOJ</title>
      </Helmet>
      <div className="flex min-h-0 flex-1 overflow-hidden border-t bg-card">
        <aside
          style={{ width: leftSidebarWidth }}
          className="flex shrink-0 flex-col border-r bg-muted/35"
        >
          <div className="border-b p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">会话列表</h2>
                <p className="text-xs text-muted-foreground">历史记录与上下文</p>
              </div>
              <button
                type="button"
                onClick={createNewChat}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground transition hover:text-foreground"
                title="新建会话"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={createNewChat}
              className="w-full rounded-md border border-dashed bg-background px-3 py-2 text-left text-sm transition hover:border-primary hover:text-primary"
            >
              开始新对话
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {!isAuthenticated ? (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                请先登录后使用智能体对话
              </p>
            ) : loadingSessions ? (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                正在加载会话...
              </p>
            ) : sessions.length === 0 ? (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                暂无会话
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`w-full rounded-md border p-3 text-left transition ${
                    currentSessionId === session.id
                      ? "border-primary/40 bg-primary/5"
                      : "border-transparent bg-background hover:border-border"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectSession(session.id)}
                    className="w-full text-left"
                  >
                    <p className="truncate text-sm font-medium">{session.title}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {session.lastMessage || "暂无消息"}
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {new Date(session.updatedAt).toLocaleString()}
                    </p>
                  </button>
                  {!session.id.startsWith("temp-session") ? (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRenameSession(session.id, session.title)}
                        className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                        重命名
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session.id)}
                        className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                        删除
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </aside>

        <div
          onMouseDown={(event) => startResize("left", event)}
          className="w-1 shrink-0 cursor-col-resize bg-border transition hover:bg-primary/50"
        />

        <main className="flex min-w-0 flex-1 flex-col">
          {currentMessages.length === 0 ? (
            <div className="flex min-h-0 flex-1 items-center justify-center p-8">
              <div className="max-w-3xl text-center">
                <h1 className="text-2xl font-semibold">SEUOJ 智能体对话</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  可以提问算法问题，并通过回答持续迭代思路。
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {QUICK_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => setInput(question)}
                      className="rounded-full bg-muted px-4 py-2 text-sm transition hover:bg-accent"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div ref={messagesContainerRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
              {currentMessages.map((message) => {
                const citations = message.role === "assistant" ? mapMessageCitations(message) : [];
                return (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-4xl rounded-xl border px-4 py-3 ${
                        message.role === "user"
                          ? "border-primary/30 bg-primary/10"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">
                          {message.role === "user" ? "你" : "AI 助手"}
                        </span>
                        <span>·</span>
                        <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                      </div>
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <MarkdownRenderer>{message.content}</MarkdownRenderer>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      )}

                      {message.role === "assistant" && citations.length > 0 ? (
                        <div className="mt-4 border-t pt-3">
                          <p className="text-xs font-medium text-muted-foreground">参考资料</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {citations.map((citation) => (
                              <span
                                key={`${message.id}-${citation.number}`}
                                className="rounded-full border px-2.5 py-1 text-xs transition hover:border-primary hover:text-primary"
                              >
                                [{citation.number}] {citation.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="shrink-0 border-t p-4">
            <div className="flex items-end gap-3 rounded-xl border bg-background p-3">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onInput={autoResizeTextarea}
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={isAuthenticated ? "请输入算法问题..." : "登录后可发送消息"}
                className="max-h-36 min-h-[32px] flex-1 resize-none bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!isAuthenticated || !input.trim() || sending}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
