export function generateTitle(content) {
  const cleaned = content.replace(/\s+/g, " ").trim();
  if (!cleaned) return "New chat";
  const words = cleaned.split(" ").slice(0, 8).join(" ");
  return words.length > 60 ? `${words.slice(0, 57)}...` : words;
}
