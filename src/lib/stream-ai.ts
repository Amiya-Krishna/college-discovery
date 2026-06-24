/**
 * streamAI — calls /api/ai proxy (Grok backend, non-streaming)
 * Fakes a smooth typing effect by rendering text word by word.
 *
 * Usage:
 *   await streamAI(prompt, (chunk) => setText(t => t + chunk), onDone, onError)
 */
export async function streamAI(
  prompt: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: () => void
) {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) { onError(); return; }

    const json = await res.json() as { text?: string; error?: string };

    if (!json.text) { onError(); return; }

    // Fake streaming: reveal text word-by-word for smooth UX
    const words = json.text.split(" ");
    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? "" : " ") + words[i];
      onChunk(chunk);
      // Small delay between words — feels like streaming
      await new Promise((r) => setTimeout(r, 18));
    }

    onDone();
  } catch {
    onError();
  }
}