const serverUrl = import.meta.env.VITE_SERVER_URL;

export async function addRssFeed(token: string | null, rssUrl: string) {
  //   const token = await getToken();
  const res = await fetch(`${serverUrl}/upload/add-feed`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rssUrl }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to add feed");
  }
  return data;
}
