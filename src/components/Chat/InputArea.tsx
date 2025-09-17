interface Props {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onReset: () => void;
  loadingSend: boolean;
  loadingReset: boolean;
}

export default function InputArea({
  input,
  setInput,
  onSend,
  onReset,
  loadingSend,
  loadingReset,
}: Props) {
  return (
    <div className="input-area">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />
      <button onClick={onSend} disabled={loadingSend}>
        {loadingSend ? "Sending..." : "Send"}
      </button>
      <button onClick={onReset} disabled={loadingReset}>
        {loadingReset ? "Resetting..." : "Reset"}
      </button>
    </div>
  );
}
