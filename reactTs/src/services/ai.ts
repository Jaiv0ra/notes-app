export type AIProvider = "gemini" | "openai";

export type AISettings = {
  apiKey: string;
  endpoint: string;
  model: string;
  provider: AIProvider;
};

export type SummaryResult = {
  summary: string;
  keyPoints: string[];
};

// --- Gemini ---

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function callGemini(
  prompt: string,
  apiKey: string,
  model: string,
  json: boolean
): Promise<string> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    const msg: string = err?.error?.message ?? `Gemini API error ${response.status}`;
    if (response.status === 400 && msg.toLowerCase().includes("api key")) {
      throw new Error("Invalid API key. Check your Gemini API key in Settings.");
    }
    if (response.status === 403) {
      throw new Error("API key not authorized. Check your Gemini API key in Settings.");
    }
    throw new Error(msg);
  }

  const data = await response.json();
  const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

// --- OpenAI-compatible ---

async function callOpenAI(
  prompt: string,
  apiKey: string,
  endpoint: string,
  model: string,
  json: boolean
): Promise<string> {
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      ...(json ? { response_format: { type: "json_object" } } : {}),
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(
      err?.error?.message ?? `API error ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();
  const content: string | undefined = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from API");
  return content;
}

// --- Dispatch ---

async function callAI(
  prompt: string,
  settings: AISettings,
  json: boolean
): Promise<string> {
  if (!settings.apiKey) {
    throw new Error("No API key configured. Add one in Settings.");
  }

  const provider = settings.provider ?? "gemini";

  if (provider === "gemini") {
    return callGemini(prompt, settings.apiKey, settings.model, json);
  }
  return callOpenAI(prompt, settings.apiKey, settings.endpoint, settings.model, json);
}

// --- Public API ---

export async function summarizeNote(
  title: string,
  markdown: string,
  settings: AISettings
): Promise<SummaryResult> {
  const prompt = `Summarize the following note titled "${title}". Return a JSON object with:
- "summary": a 1-2 sentence plain-text summary
- "keyPoints": an array of 3-5 concise bullet points (strings, no markdown)

Note content:
${markdown}`;

  const content = await callAI(prompt, settings, true);
  const parsed = JSON.parse(content) as Partial<SummaryResult>;
  if (!parsed.summary || !Array.isArray(parsed.keyPoints)) {
    throw new Error("Unexpected response format from API");
  }
  return { summary: parsed.summary, keyPoints: parsed.keyPoints };
}

export async function beautifyMarkdown(
  title: string,
  markdown: string,
  settings: AISettings
): Promise<string> {
  const prompt = `You are a markdown editor. Beautify the following note into clean, well-structured markdown.

Rules:
- Preserve ALL information — never add or remove facts
- Add appropriate headings (##, ###) where content has distinct sections
- Convert prose lists into bullet points where appropriate
- Fix grammar and punctuation
- Ensure consistent formatting
- Return ONLY the beautified markdown, no explanations, no code fences

Note title: "${title}"

Content:
${markdown}`;

  const raw = await callAI(prompt, settings, false);
  // Strip accidental code-fence wrapping (```markdown ... ``` or ``` ... ```)
  return raw.replace(/^```(?:markdown)?\n?/i, "").replace(/\n?```\s*$/, "").trim();
}
