export interface YandexGptConfig {
  apiKey: string;
  folderId: string;
  model?: string;
  endpoint?: string;
}

export interface YandexGptMessage {
  role: "system" | "user" | "assistant";
  text: string;
}

export interface YandexGptCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface YandexGptCompletion {
  text: string;
  raw: unknown;
}

const DEFAULT_ENDPOINT =
  "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

export class YandexGptClient {
  constructor(private readonly cfg: YandexGptConfig) {
    if (!cfg.apiKey) throw new Error("YANDEX_GPT_API_KEY is required");
    if (!cfg.folderId) throw new Error("YANDEX_GPT_FOLDER_ID is required");
  }

  async complete(
    messages: YandexGptMessage[],
    opts: YandexGptCompletionOptions = {},
  ): Promise<YandexGptCompletion> {
    const modelUri = `gpt://${this.cfg.folderId}/${this.cfg.model ?? "yandexgpt-lite/latest"}`;
    const body = {
      modelUri,
      completionOptions: {
        stream: !!opts.stream,
        temperature: opts.temperature ?? 0.2,
        maxTokens: String(opts.maxTokens ?? 600),
      },
      messages,
    };
    const endpoint = this.cfg.endpoint ?? DEFAULT_ENDPOINT;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Api-Key ${this.cfg.apiKey}`,
        "x-folder-id": this.cfg.folderId,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`YandexGPT HTTP ${res.status}: ${errText.slice(0, 500)}`);
    }
    const data: unknown = await res.json();
    const text = extractText(data);
    return { text, raw: data };
  }
}

function extractText(data: unknown): string {
  const d = data as {
    result?: {
      alternatives?: Array<{ message?: { text?: string }; text?: string }>;
    };
  };
  const alt = d?.result?.alternatives?.[0];
  if (!alt) return "";
  if (alt.message?.text) return alt.message.text;
  if (alt.text) return alt.text;
  return "";
}
