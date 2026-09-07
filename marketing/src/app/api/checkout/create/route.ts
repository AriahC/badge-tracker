import { NextRequest, NextResponse } from "next/server";
import {
  FOUNDING_FAMILY_AMOUNT_CENTS,
  FOUNDING_FAMILY_CURRENCY,
  FOUNDING_FAMILY_PRODUCT_NAME,
  appOrigin,
  getStripe,
} from "@/lib/stripe";

type Body = {
  email?: string;
  name?: string;
  marketingOptIn?: boolean;
  referredByCode?: string;
};

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "A valid adult email address is required." },
      { status: 400 },
    );
  }

  const name = body.name?.trim() || undefined;
  const marketingOptIn = Boolean(body.marketingOptIn);
  const referredByCode = body.referredByCode?.trim() || undefined;
  const origin = appOrigin(request.url);

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: FOUNDING_FAMILY_CURRENCY,
            unit_amount: FOUNDING_FAMILY_AMOUNT_CENTS,
            product_data: {
              name: FOUNDING_FAMILY_PRODUCT_NAME,
              description:
                "One-time early-access pass for Girl Scout families. Not a subscription.",
            },
          },
        },
      ],
      metadata: {
        product: "founding_family",
        adult_email: email,
        adult_name: name ?? "",
        marketing_opt_in: marketingOptIn ? "1" : "0",
        referred_by: referredByCode ?? "",
      },
      payment_intent_data: {
        metadata: {
          product: "founding_family",
          adult_email: email,
        },
      },
      success_url: `${origin}/welcome/founding-family?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/founding-family?canceled=1`,
      // One-time only — never create a subscription.
      submit_type: "pay",
      billing_address_collection: "auto",
      allow_promotion_codes: false,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to start checkout.";
    console.error("[checkout/create]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
