import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChatMessage } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Chat() {
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["chat-history"],
    queryFn: async () => {
      const res = await fetch("/api/chat/history");
      if (!res.ok) throw new Error("Failed to fetch chat history");
      return res.json() as Promise<{ messages: ChatMessage[] }>;
    },
  });

  const sendMessageMutation = useMutation({
    // content = user's typed message
    mutationFn: async (content: string) => {
      const userText = content.trim();
      if (!userText) return;

      // 1️⃣ Save USER message to DB
      const userRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: userText }),
      });
      if (!userRes.ok) {
        throw new Error("Failed to save user message");
      }

      // 2️⃣ Call HYBRID brain (GPT + Perplexity)
      const hybridRes = await fetch("/api/hybrid-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // we send only the latest user question;
          // the server adds memory + research
          messages: [{ role: "user", content: userText }],
        }),
      });

      if (!hybridRes.ok) {
        const errText = await hybridRes.text();
        throw new Error(
          `Hybrid assistant failed: ${hybridRes.status} ${errText || ""}`,
        );
      }

      const hybridData: { reply: string; usedResearch?: boolean } =
        await hybridRes.json();
      const assistantReply = hybridData.reply || "…";

      // 3️⃣ Save ASSISTANT message to DB
      const assistantRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "assistant", content: assistantReply }),
      });
      if (!assistantRes.ok) {
        throw new Error("Failed to save assistant message");
      }

      return hybridData;
    },
    onSuccess: () => {
      // refresh history so UI shows both new messages
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
      setInput("");
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/chat/history", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to clear history");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(input.trim());
  };

  return (
    <div className="glass-card flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white">Vipu Assistant</h2>
            <p className="text-xs text-indigo-300">
              Always online • Hybrid AI (GPT + Research)
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm("Clear all chat history?")) {
              clearHistoryMutation.mutate();
            }
          }}
          className="p-2 text-gray-500 hover:text-red-400 rounded transition-colors"
          data-testid="button-clear-history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : data?.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm">
              No messages yet. Start a conversation with VipuDev.AI!
            </p>
          </div>
        ) : (
          data?.messages.map((message) => {
            const isBot = message.role === "assistant";
            return (
              <div
                key={message.id}
                className={`flex gap-4 max-w-3xl ${
                  isBot ? "" : "ml-auto flex-row-reverse"
                }`}
                data-testid={`message-${message.id}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border mt-1 ${
                    isBot
                      ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                      : "bg-gray-700 text-gray-300 border-gray-600"
                  }`}
                >
                  {isBot ? (
                    <Bot className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isBot
                        ? "bg-white/10 text-gray-200 rounded-tl-none border border-white/5"
                        : "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/20"
                    }`}
                  >
                    {message.content}
                  </div>
                  <div
                    className={`text-xs text-gray-600 ${
                      isBot ? "ml-1" : "mr-1 text-right"
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-white/5 border-t border-white/10">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask VipuDevAI anything about your code, project, or the world..."
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pr-12 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none min-h-[60px]"
            data-testid="input-chat-message"
          />
          <button
            onClick={handleSend}
            disabled={sendMessageMutation.isPending || !input.trim()}
            className="absolute right-3 top-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-send-message"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="text-center text-[10px] text-gray-600 mt-2">
          Answers use both deep reasoning and fresh research. Still review
          sensitive code once.
        </div>
      </div>
    </div>
  );
}
