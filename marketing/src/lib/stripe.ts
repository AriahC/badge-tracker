import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY. Add it to marketing/.env.local (see .env.example).",
    );
  }
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export const FOUNDING_FAMILY_AMOUNT_CENTS = 100;
export const FOUNDING_FAMILY_CURRENCY = "usd";
export const FOUNDING_FAMILY_PRODUCT_NAME = "Veya Founding Family Early Access";

export function appOrigin(requestUrl: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const url = new URL(requestUrl);
  return url.origin;
}
