import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
// import type { Message } from "../types";
import { fetchChatHistory, clearChat } from "../services/chatService";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useChat() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const token = await getToken();
      const data = await fetchChatHistory(token);
      if (data?.success && Array.isArray(data.history)) {
        setMessages(data.history);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  async function resetChat() {
    setLoadingReset(true);
    try {
      const token = await getToken();

      await clearChat(token);
      setMessages([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset chat");
    } finally {
      setLoadingReset(false);
    }
  }

  /**
   * sendMessage handles streaming from the server.
   * It adds a user message, then an assistant placeholder: {typing: true}
   * As chunks arrive it replaces the assistant placeholder with real content.
   */
  async function sendMessage(text: string) {
    if (!text.trim()) return;
    setError(null);
    setLoadingSend(true);

    // push user and assistant typing placeholder
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const token = await getToken();
      const res = await fetch(`${serverUrl}/chat/ask`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: text }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      if (!res.body) throw new Error("No response body from server");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.startsWith("data:"));

        for (const line of lines) {
          const payload = line.replace(/^data:\s*/, "");
          if (payload === "[DONE]") {
            // stream finished; continue to outer loop to finish
            continue;
          }

          try {
            const json = JSON.parse(payload);
            if (json.text) {
              assistantMsg += json.text;

              // update last assistant message
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  last.content = assistantMsg;
                  return [...updated];
                }
                return [
                  ...updated,
                  { role: "assistant", content: assistantMsg },
                ];
              });
            }
          } catch (e) {
            // ignore JSON parse errors for partial chunks
            console.error("parse chunk error", e);
          }
        }
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred"
      );
    } finally {
      setLoadingSend(false);
    }
  }

  return {
    messages,
    setMessages,
    sendMessage,
    resetChat,
    loadHistory,
    loadingSend,
    loadingHistory,
    loadingReset,
    error,
    setError,
  };
}
