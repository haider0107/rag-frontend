interface Props {
  error: string | null;
  onClose: () => void;
}

export default function ErrorPopup({ error, onClose }: Props) {
  if (!error) return null;
  return (
    <div className="error-popup">
      <div className="error-content">
        <p>{error}</p>
        <button onClick={onClose}>✖</button>
      </div>
    </div>
  );
}
