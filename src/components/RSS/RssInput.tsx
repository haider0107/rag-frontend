interface Props {
  rssUrl: string;
  setRssUrl: (val: string) => void;
  onFeed: () => void;
  loading: boolean;
}

export default function RssInput({
  rssUrl,
  setRssUrl,
  onFeed,
  loading,
}: Props) {
  return (
    <div className="rss-input">
      <input
        type="url"
        value={rssUrl}
        onChange={(e) => setRssUrl(e.target.value)}
        placeholder="Enter RSS feed URL..."
      />
      <button onClick={onFeed} disabled={loading}>
        {loading ? "Feeding..." : "Feed Data"}
      </button>
    </div>
  );
}
