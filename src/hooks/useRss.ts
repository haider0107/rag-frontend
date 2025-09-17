import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { addRssFeed as addRssService } from "../services/rssService";

export function useRss() {
  const { getToken } = useAuth();
  const [rssModalOpen, setRssModalOpen] = useState(false);
  const [rssProcessing, setRssProcessing] = useState(false);
  const [totalArticles, setTotalArticles] = useState<number | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addRssFeed(rssUrl: string) {
    if (!rssUrl.trim()) return;
    setError(null);
    setLoadingFeed(true);
    setRssModalOpen(true);
    setRssProcessing(true);
    setTotalArticles(null);

    try {
        const token = await getToken();
      const data = await addRssService(token, rssUrl);
      setTotalArticles(data.totalArticles ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add feed");
    } finally {
      setRssProcessing(false);
      setLoadingFeed(false);
    }
  }

  return {
    rssModalOpen,
    setRssModalOpen,
    rssProcessing,
    totalArticles,
    loadingFeed,
    error,
    setError,
    addRssFeed,
  };
}
