import { randomUUID } from "node:crypto";

export interface YookassaConfig {
  shopId: string;
  secretKey: string;
  returnUrl: string;
  priceRub: number;
}

export interface CreatePaymentArgs {
  amountRub: number;
  description: string;
  metadata: Record<string, string>;
  idempotenceKey?: string;
}

export interface YookassaPayment {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  paid: boolean;
  amount: { value: string; currency: string };
  confirmation?: { type: string; confirmation_url?: string };
  metadata?: Record<string, string>;
  captured_at?: string;
}

export class YookassaClient {
  constructor(private readonly cfg: YookassaConfig) {
    if (!cfg.shopId || !cfg.secretKey) {
      throw new Error("YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY обязательны");
    }
  }

  private auth() {
    return (
      "Basic " +
      Buffer.from(`${this.cfg.shopId}:${this.cfg.secretKey}`).toString("base64")
    );
  }

  async createPayment(args: CreatePaymentArgs): Promise<YookassaPayment> {
    const body = {
      amount: { value: args.amountRub.toFixed(2), currency: "RUB" },
      capture: true,
      description: args.description,
      confirmation: {
        type: "redirect",
        return_url: this.cfg.returnUrl,
      },
      metadata: args.metadata,
    };
    const res = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": args.idempotenceKey ?? randomUUID(),
        Authorization: this.auth(),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ЮKassa HTTP ${res.status}: ${text.slice(0, 500)}`);
    }
    return (await res.json()) as YookassaPayment;
  }

  async getPayment(id: string): Promise<YookassaPayment> {
    const res = await fetch(`https://api.yookassa.ru/v3/payments/${id}`, {
      headers: { Authorization: this.auth() },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ЮKassa GET ${res.status}: ${text.slice(0, 500)}`);
    }
    return (await res.json()) as YookassaPayment;
  }
}
