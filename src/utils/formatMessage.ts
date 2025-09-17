export function formatMessage(content: string) {
  let formatted = content.replace(/\[Source\s*\d+(,\s*\d+)*\]/g, "");
  formatted = formatted.replace(
    /\[Source\s+(https?:\/\/[^\s\]]+)\]/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">🔗 Source</a>'
  );
  formatted = formatted.replace(
    /(?<!href=")(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">🔗 Source</a>'
  );
  formatted = formatted
    .split(/\n+/)
    .map((p) => `<p>${p.trim()}</p>`)
    .join("");
  return formatted.trim();
}
