import "./App.css";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function App() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Send a message to backend (/chat/ask)
  async function sendMessage() {
    if (!input.trim()) return;

    // Add user message locally
    const newMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);

    setLoading(true);

    try {
      const token = await getToken();

      // Use EventSource-like stream via fetch
      const res = await fetch("http://localhost:5000/chat/ask", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      let assistantMsg = "";

      // Read stream chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("data:"));

        for (const line of lines) {
          if (line === "data: [DONE]") {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: assistantMsg },
            ]);
            setLoading(false);
            return;
          }

          try {
            const json = JSON.parse(line.replace("data: ", ""));
            if (json.text) {
              assistantMsg += json.text;
              // Show streaming message
              setMessages((prev) => {
                const temp = [...prev];
                const last = temp[temp.length - 1];
                if (last && last.role === "assistant") {
                  last.content = assistantMsg;
                  return [...temp];
                }
                return [...temp, { role: "assistant", content: assistantMsg }];
              });
            }
          } catch (err) {
            console.error("Stream parse error:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
    } finally {
      setInput("");
    }
  }

  // 🔹 Reset chat (/chat/clear)
  async function resetChat() {
    const token = await getToken();
    await fetch("http://localhost:5000/chat/clear", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    setMessages([]);
  }

  return (
    <div className="App">
      <p>Hello World!</p>

      <SignedOut>
        <SignInButton />
      </SignedOut>

      <SignedIn>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <UserButton />
          <button onClick={resetChat}>Reset Chat</button>
        </div>

        {/* Chat window */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            margin: "1rem 0",
            height: "400px",
            overflowY: "auto",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                margin: "0.5rem 0",
                textAlign: msg.role === "user" ? "right" : "left",
              }}
            >
              <strong>{msg.role === "user" ? "You" : "AI"}:</strong>{" "}
              <span>{msg.content}</span>
            </div>
          ))}
          {loading && <p>AI is typing...</p>}
        </div>

        {/* Input box */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            style={{ flex: 1, padding: "0.5rem" }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </SignedIn>
    </div>
  );
}

export default App;
