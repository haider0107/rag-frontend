import "./App.scss";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import SignInModal from "./components/Auth/SignInModal";
import SignUpModal from "./components/Auth/SignUpModal";
import RssInput from "./components/RSS/RssInput";
import RssModal from "./components/RSS/RssModal";
import Messages from "./components/Chat/Messages";
import InputArea from "./components/Chat/InputArea";
import ErrorPopup from "./components/common/ErrorPopup";
import { useChat } from "./hooks/useChat";
import { useRss } from "./hooks/useRss";
import { useScrollToBottom } from "./hooks/useScrollToBottom";

export default function App() {
  const {
    messages,
    sendMessage,
    resetChat,
    loadingSend,
    loadingHistory,
    loadingReset,
    error: chatError,
    setError: setChatError,
  } = useChat();

  const {
    rssModalOpen,
    setRssModalOpen,
    rssProcessing,
    totalArticles,
    loadingFeed,
    addRssFeed,
    error: rssError,
    setError: setRssError,
  } = useRss();

  const [input, setInput] = useState("");
  const [rssUrl, setRssUrl] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const messagesEndRef = useScrollToBottom([messages]);

  function handleSend() {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  }

  function handleFeed() {
    if (!rssUrl.trim()) return;
    addRssFeed(rssUrl);
  }

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

      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
      <SignUpModal open={showSignUp} onClose={() => setShowSignUp(false)} />

      <ErrorPopup
        error={chatError || rssError}
        onClose={() => {
          setChatError(null);
          setRssError(null);
        }}
      />

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

      <SignedIn>
        <RssInput
          rssUrl={rssUrl}
          setRssUrl={setRssUrl}
          onFeed={handleFeed}
          loading={loadingFeed}
        />
        <RssModal
          open={rssModalOpen}
          processing={rssProcessing}
          totalArticles={totalArticles}
          onClose={() => setRssModalOpen(false)}
        />

        <div className="chat-container">
          <div className="chat-box">
            <div className="messages">
              <Messages messages={messages} loadingHistory={loadingHistory} loadingSend={loadingSend} />
              {/* messagesEndRef ensures scroll-to-bottom */}
              <div ref={messagesEndRef} />
            </div>

            <InputArea
              input={input}
              setInput={setInput}
              onSend={handleSend}
              onReset={resetChat}
              loadingSend={loadingSend}
              loadingReset={loadingReset}
            />
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
