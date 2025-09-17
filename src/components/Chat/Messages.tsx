import MessageItem from "./MessageItem";
import type { Message } from "../../types";

interface Props {
  messages: Message[];
  loadingHistory: boolean;
  loadingSend: boolean;
}

export default function Messages({
  messages,
  loadingHistory,
  loadingSend,
}: Props) {
  if (loadingHistory)
    return <div className="loading">Loading chat history...</div>;
  if (messages.length === 0)
    return (
      <div className="suggestions">
        <p>Try asking me:</p>
        <ul>
          <li>📰 What’s the latest news in tech?</li>
          <li>🌍 Give me a summary of today’s world events</li>
          <li>🏏 What’s the latest cricket score?</li>
          <li>💼 What are the top business headlines?</li>
        </ul>
      </div>
    );

  return (
    <>
      {messages.map((m, i) => (
        <MessageItem msg={m} key={i} />
      ))}
      {loadingSend ? <div className="message assistant typing"></div> : null}
    </>
  );
}
