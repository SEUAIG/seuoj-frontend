import { deepseekStream, DeepSeekMessage } from "@/services/ai/deepseek";
import React, { useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

type Message = {
  role: "user" | "assistant";
  content: string;
};
export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "你好，我是deepseek驱动的AI助手，你可以向我提问。",
    },
  ]);
  const [input, setInput] = useState("");
  async function handleSend() {
    if (!input.trim()) {
      return;
    }

    const userInput = input.trim();
    const userMessage: DeepSeekMessage = {
      role: "user",
      content: userInput,
    };
    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", content: "" },
    ]);
    setInput("");
    const response = await deepseekStream([
      ...messages,
      userMessage,
    ] as DeepSeekMessage[]);
    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let assistantText = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.replace("data:", "").trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (!delta) continue;
          assistantText += delta;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: "assistant",
              content: assistantText,
            };
            return copy;
          });
        } catch {}
      }
    }
  }
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);
  return (
    <div className="flex h-[500px] w-[360px] flex-col rounded-xl border bg-white shadow">
      <div className="chat-handle border-b px-4 py-3 font-semibold cursor-move select-none bg-gray-50 rounded-t-xl">
        AI 助手
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                message.role === "user"
                  ? "bg-blue-500 text-white whitespace-pre-wrap break-words"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="markdown-body text-sm [&_p]:mb-2 [&_p:last-child]:mb-0 [&_pre]:bg-gray-800 [&_pre]:text-white [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-xs [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
                  <MarkdownRenderer>{message.content}</MarkdownRenderer>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          rows={1}
          className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 max-h-[100px] overflow-y-auto"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          onInput={(e) => {
            e.currentTarget.style.height = "auto";
            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
          }}
        />
        <button
          onClick={handleSend}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white"
        >
          发送
        </button>
      </div>
    </div>
  );
}
