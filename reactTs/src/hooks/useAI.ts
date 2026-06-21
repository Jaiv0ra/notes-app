import { useEffect } from "react";
import { useLocalStorage } from "../useLocalStorage";
import type { AISettings } from "../services/ai";

const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const hasRealKey = Boolean(envKey && envKey !== "your_gemini_api_key_here");

const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: hasRealKey ? envKey! : "",
  endpoint: "https://api.openai.com/v1",
  model: "gemini-2.5-flash",
  provider: "gemini",
};

// Models that have been deprecated/quota-exceeded → their replacements
const MODEL_MIGRATIONS: Record<string, string> = {
  "gemini-2.0-flash": "gemini-2.5-flash",
  "gemini-2.0-flash-exp": "gemini-2.5-flash",
};

export function useAISettings() {
  const [settings, setSettings] = useLocalStorage<AISettings>(
    "NV_AI_SETTINGS",
    DEFAULT_AI_SETTINGS
  );

  // Migrate stale localStorage values: deprecated model names, missing provider field
  useEffect(() => {
    setSettings((s) => {
      const migratedModel = MODEL_MIGRATIONS[s.model];
      const missingProvider = !s.provider;
      if (!migratedModel && !missingProvider) return s; // unchanged → no re-render
      return {
        ...s,
        model: migratedModel ?? s.model,
        provider: s.provider ?? "gemini",
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [settings, setSettings] as [AISettings, typeof setSettings];
}
