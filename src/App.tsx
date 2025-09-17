import "./App.scss";
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function App() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [rssUrl, setRssUrl] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [rssModalOpen, setRssModalOpen] = useState(false);
  const [rssProcessing, setRssProcessing] = useState(false);
  const [totalArticles, setTotalArticles] = useState<number | null>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function sendMessage() {
    if (!input.trim()) return;
    setLoadingSend(true);
    const token = await getToken();

    const newMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const res = await fetch("http://localhost:5000/chat/ask", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No response body from server");
      }

      const reader = res.body.getReader();
      let assistantMsg = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("data:"));

        for (const line of lines) {
          if (line === "data: [DONE]") return;

          try {
            const json = JSON.parse(line.replace("data: ", ""));
            if (json.text) {
              assistantMsg += json.text;
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  last.content = assistantMsg;
                  return [...updated];
                }
                return [
                  ...updated,
                  { role: "assistant", content: assistantMsg, typing: false },
                ];
              });
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoadingSend(false);
      setInput("");
    }
  }

  function formatMessage(content: string) {
    // 1. Remove [Source 1], [Source 1, 2], etc. (no URLs)
    let formatted = content.replace(/\[Source\s*\d+(,\s*\d+)*\]/g, "");

    // 2. Replace [Source https://...] → 🔗 Source
    formatted = formatted.replace(
      /\[Source\s+(https?:\/\/[^\s\]]+)\]/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">🔗 Source</a>'
    );

    // 3. Replace standalone URLs (only if not already inside <a>)
    formatted = formatted.replace(
      /(?<!href=")(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">🔗 Source</a>'
    );

    // 4. Add paragraph breaks for cleaner display
    formatted = formatted
      .split(/\n+/) // split on newlines
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p}</p>`)
      .join("");

    return formatted.trim();
  }

  async function resetChat() {
    setLoadingReset(true);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/chat/clear", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to clear chat history");
      setMessages([]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoadingReset(false);
    }
  }

  async function addRssFeed() {
    if (!rssUrl.trim()) return;

    setLoadingFeed(true);
    setRssModalOpen(true); // ✅ show modal
    setRssProcessing(true);
    setTotalArticles(null);

    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/upload/add-feed", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rssUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to process feed");
      }

      setTotalArticles(data.totalArticles || 0);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setRssProcessing(false);
      setLoadingFeed(false);
      setRssUrl("");
    }
  }

  useEffect(() => {
    async function loadHistory() {
      setLoadingHistory(true);
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:5000/chat/history", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setMessages(data.history);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load chat history");
        }
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, [getToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="App theme-purple">
      <header>
        <h1>📰 AI News Assistant</h1>
        <SignedOut>
          <div className="auth">
            <button onClick={() => setShowSignIn(true)}>Login</button>
            <button onClick={() => setShowSignUp(true)}>Register</button>
          </div>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      {/* Show Summary when signed out */}
      <SignedOut>
        <section className="landing">
          <h2>Welcome to AI News Assistant</h2>
          <p>
            This project collects the latest news articles, embeds them using
            AI-powered embeddings, and lets you ask questions about daily
            events. Get summarized answers, relevant sources, and stay informed
            with AI.
          </p>
          <p>
            👉 To use the chat and personalized features, please{" "}
            <strong>Login</strong> or <strong>Register</strong>.
          </p>
        </section>
      </SignedOut>

      {error && (
        <div className="error-popup">
          <div className="error-content">
            <p>{error}</p>
            <button onClick={() => setError(null)}>✖</button>
          </div>
        </div>
      )}

      {showSignIn && (
        <div className="modal">
          <div className="modal-content">
            <SignIn />
            <button className="close-btn" onClick={() => setShowSignIn(false)}>
              ✖
            </button>
          </div>
        </div>
      )}

      {showSignUp && (
        <div className="modal">
          <div className="modal-content">
            <SignUp />
            <button className="close-btn" onClick={() => setShowSignUp(false)}>
              ✖
            </button>
          </div>
        </div>
      )}

      {rssModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content rss-modal">
            {rssProcessing ? (
              <>
                <div className="loader"></div>
                <p>
                  Processing RSS feed. This may take a few minutes, please
                  wait...
                </p>
              </>
            ) : (
              <>
                <p>✅ Successfully embedded {totalArticles} articles!</p>
                <button onClick={() => setRssModalOpen(false)}>Close</button>
              </>
            )}
          </div>
        </div>
      )}

      <SignedIn>
        {/* RSS feed input */}
        <div className="rss-input">
          <input
            type="url"
            value={rssUrl}
            onChange={(e) => setRssUrl(e.target.value)}
            placeholder="Enter RSS feed URL..."
          />
          <button onClick={addRssFeed} disabled={loadingFeed}>
            {loadingFeed ? "Feeding..." : "Feed Data"}
          </button>
        </div>

        {/* Chat container */}
        <div className="chat-container">
          <div className="chat-box">
            <div className="messages">
              {loadingHistory ? (
                <div className="loading">Loading chat history...</div>
              ) : messages.length === 0 ? (
                <div className="suggestions">
                  <p>Try asking me:</p>
                  <ul>
                    <li>📰 What’s the latest news in tech?</li>
                    <li>🌍 Give me a summary of today’s world events</li>
                    <li>🏏 What’s the latest cricket score?</li>
                    <li>💼 What are the top business headlines?</li>
                  </ul>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`message ${msg.role} `}
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(msg.content),
                    }}
                  />
                ))
              )}

              {loadingSend ? (
                <div className="message assistant typing"></div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} disabled={loadingSend}>
                {loadingSend ? "Sending..." : "Send"}
              </button>
              <button onClick={resetChat} disabled={loadingReset}>
                {loadingReset ? "Resetting..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}

export default App;
