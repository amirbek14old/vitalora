import "server-only";

/** Payment settings from environment variables. A provider is shown only when it is fully configured. */
export const PRO_PRODUCT = "pro_14d";

export function proPriceUzs(): number {
  // ≈ $5. Set PRO_PRICE_UZS to match the current exchange rate.
  const n = Number(process.env.PRO_PRICE_UZS ?? 65000);
  return Number.isFinite(n) && n >= 1000 ? Math.round(n) : 65000;
}

export const payme = {
  merchantId: process.env.PAYME_MERCHANT_ID ?? "",
  key: process.env.PAYME_KEY ?? "", // test key in test mode, production key in live mode
  test: process.env.PAYME_TEST === "1",
  get enabled() { return !!(this.merchantId && this.key); },
};

export const click = {
  serviceId: process.env.CLICK_SERVICE_ID ?? "",
  merchantId: process.env.CLICK_MERCHANT_ID ?? "",
  secretKey: process.env.CLICK_SECRET_KEY ?? "",
  get enabled() { return !!(this.serviceId && this.merchantId && this.secretKey); },
};

export function appUrl(): string {
  return (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")).replace(/\/$/, "");
}

/** Payme checkout link: base64("m=…;ac.order_id=…;a=<tiyin>;c=<return url>"). */
export function paymeCheckoutUrl(orderId: string, amountUzs: number, returnUrl: string, lang = "ru"): string {
  const params = `m=${payme.merchantId};ac.order_id=${orderId};a=${amountUzs * 100};l=${lang};c=${returnUrl}`;
  const host = payme.test ? "https://checkout.test.paycom.uz" : "https://checkout.paycom.uz";
  return `${host}/${Buffer.from(params).toString("base64")}`;
}

/** Click checkout link. */
export function clickCheckoutUrl(orderId: string, amountUzs: number, returnUrl: string): string {
  const q = new URLSearchParams({
    service_id: click.serviceId,
    merchant_id: click.merchantId,
    amount: String(amountUzs),
    transaction_param: orderId,
    return_url: returnUrl,
  });
  return `https://my.click.uz/services/pay?${q.toString()}`;
}
