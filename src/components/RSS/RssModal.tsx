interface Props {
  open: boolean;
  processing: boolean;
  totalArticles: number | null;
  onClose: () => void;
}

export default function RssModal({
  open,
  processing,
  totalArticles,
  onClose,
}: Props) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content rss-modal">
        {processing ? (
          <>
            <div className="loader"></div>
            <p>
              Processing RSS feed. This may take a few minutes, please wait...
            </p>
          </>
        ) : (
          <>
            <p>✅ Successfully embedded {totalArticles} articles!</p>
            <button onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
}
