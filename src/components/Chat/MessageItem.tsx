// import type { Message } from "../../types";
import { formatMessage } from "../../utils/formatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MessageItem({ msg }: { msg: Message }) {
  const className = `message ${msg.role}`;
  // if typing, we render empty content (animation from CSS)
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: formatMessage(msg.content),
      }}
    />
  );
}
