import { NextRequest, NextResponse } from "next/server";
import {
  FOUNDING_FAMILY_AMOUNT_CENTS,
  FOUNDING_FAMILY_CURRENCY,
  getStripe,
} from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id." },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid =
      session.payment_status === "paid" ||
      session.status === "complete";
    const amountOk =
      session.amount_total === FOUNDING_FAMILY_AMOUNT_CENTS &&
      session.currency === FOUNDING_FAMILY_CURRENCY;
    const productOk = session.metadata?.product === "founding_family";

    if (!paid || !amountOk || !productOk) {
      return NextResponse.json(
        {
          paid: false,
          error: "This checkout session is not a completed $1 Founding Family purchase.",
        },
        { status: 402 },
      );
    }

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      session.metadata?.adult_email ||
      "";
    const name =
      session.customer_details?.name ||
      session.metadata?.adult_name ||
      "";
    const marketingOptIn = session.metadata?.marketing_opt_in === "1";
    const referralCode = session.id.slice(-8).toUpperCase();

    return NextResponse.json({
      paid: true,
      email,
      name,
      marketingOptIn,
      referralCode,
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to verify checkout.";
    console.error("[checkout/verify]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
