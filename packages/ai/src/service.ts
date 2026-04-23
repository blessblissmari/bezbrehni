import {
  VERDICT_LABELS,
  type AnalyzeResult,
  type AnalyzeVerdict,
  type ProAction,
  type ProActionResult,
} from "@bezbrehni/shared";
import {
  PROMPT_BASIC_CHECK,
  PRO_ACTION_PROMPTS,
  SYSTEM_BASE,
  userPromptForCheck,
  userPromptForProAction,
} from "./prompts";
import { YandexGptClient, type YandexGptConfig } from "./yandexgpt";

export interface AiServiceConfig extends YandexGptConfig {}

const VALID_VERDICTS: AnalyzeVerdict[] = [
  "reliable",
  "suspicious",
  "contradictory",
  "opinion",
  "unknown",
];

export class AiService {
  private readonly client: YandexGptClient;
  constructor(cfg: AiServiceConfig) {
    this.client = new YandexGptClient(cfg);
  }

  async basicCheck(args: {
    text: string;
    pageTitle?: string;
    pageUrl?: string;
  }): Promise<AnalyzeResult> {
    const { text: modelText } = await this.client.complete(
      [
        { role: "system", text: `${SYSTEM_BASE}\n\n${PROMPT_BASIC_CHECK}` },
        {
          role: "user",
          text: userPromptForCheck(args.text, args.pageTitle, args.pageUrl),
        },
      ],
      { temperature: 0.1, maxTokens: 400 },
    );
    return parseVerdictJson(modelText);
  }

  async proAction(args: {
    action: ProAction;
    text: string;
    question?: string;
    pageTitle?: string;
    pageUrl?: string;
  }): Promise<ProActionResult> {
    const sys = `${SYSTEM_BASE}\n\n${PRO_ACTION_PROMPTS[args.action]}`;
    const { text } = await this.client.complete(
      [
        { role: "system", text: sys },
        {
          role: "user",
          text: userPromptForProAction(
            args.action,
            args.text,
            args.question,
            args.pageTitle,
            args.pageUrl,
          ),
        },
      ],
      { temperature: 0.3, maxTokens: 700 },
    );
    return { action: args.action, text: text.trim() };
  }
}

export function parseVerdictJson(modelText: string): AnalyzeResult {
  const fallback: AnalyzeResult = {
    verdict: "unknown",
    verdict_label: VERDICT_LABELS.unknown ?? "Недостаточно данных",
    summary: "Не удалось уверенно оценить фрагмент. Попробуйте другой текст.",
    reasons: [],
    confidence: 0,
  };
  const jsonBlock = extractFirstJsonObject(modelText);
  if (!jsonBlock) return fallback;
  try {
    const raw = JSON.parse(jsonBlock) as Record<string, unknown>;
    const verdictRaw = typeof raw.verdict === "string" ? raw.verdict : "unknown";
    const verdict: AnalyzeVerdict = (VALID_VERDICTS as string[]).includes(verdictRaw)
      ? (verdictRaw as AnalyzeVerdict)
      : "unknown";
    const summary =
      typeof raw.summary === "string" && raw.summary.trim().length
        ? raw.summary.trim()
        : fallback.summary;
    const reasons = Array.isArray(raw.reasons)
      ? raw.reasons
          .filter((x) => typeof x === "string")
          .map((x) => (x as string).trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];
    const confidence =
      typeof raw.confidence === "number" && raw.confidence >= 0 && raw.confidence <= 1
        ? raw.confidence
        : 0.5;
    return {
      verdict,
      verdict_label: VERDICT_LABELS[verdict] ?? verdict,
      summary,
      reasons,
      confidence,
    };
  } catch {
    return fallback;
  }
}

function extractFirstJsonObject(s: string): string | null {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return s.slice(start, end + 1);
}
