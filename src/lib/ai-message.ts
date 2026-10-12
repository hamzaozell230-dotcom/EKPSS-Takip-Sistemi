export type Msg = { role: "user" | "assistant"; content: string; image?: string };
export function providerMessages(messages: Msg[]) {
  return messages.map(m => ({ role: m.role, content: m.image && m.role === "user" ? [
    { type: "text", text: m.content },
    { type: "image_url", image_url: { url: m.image } },
  ] : m.content }));
}