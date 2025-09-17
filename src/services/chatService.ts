const serverUrl = import.meta.env.VITE_SERVER_URL;

export async function fetchChatHistory(token: string | null) {
  //   const token = await getToken();
  const res = await fetch(`${serverUrl}/chat/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to load chat history");
  return res.json();
}

export async function clearChat(token: string | null) {
  //   const token = await getToken();
  const res = await fetch(`${serverUrl}/chat/clear`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to clear chat history");
  return res;
}
