import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

export const runtime = "nodejs";

/*
 * Prevent Next.js from attempting to statically evaluate this API route.
 * This route should only run when Stripe sends a webhook request.
 */
export const dynamic = "force-dynamic";

function escapeHtml(value: string | null | undefined) {
  if (!value) return "";

  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(amount: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((amount ?? 0) / 100);
}

export async function POST(req: NextRequest) {
  /*
   * Read and clean every environment variable inside POST().
   *
   * This prevents Stripe and Resend from initializing while Vercel
   * is building the application.
   */
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const ownerEmail = process.env.HERBALUR_OWNER_EMAIL?.trim();
  const fromEmail = process.env.ORDER_FROM_EMAIL?.trim();

  if (!stripeSecretKey) {
    console.error("Missing STRIPE_SECRET_KEY.");

    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 }
    );
  }

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET.");

    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 }
    );
  }

  if (!resendApiKey || !ownerEmail || !fromEmail) {
    console.error(
      "Missing RESEND_API_KEY, HERBALUR_OWNER_EMAIL, or ORDER_FROM_EMAIL."
    );

    return NextResponse.json(
      { error: "Order email is not configured." },
      { status: 503 }
    );
  }

  /*
   * Create the external service clients only when the endpoint
   * receives an actual request.
   *
   * They will no longer initialize during `next build`.
   */
  const stripe = new Stripe(stripeSecretKey);
  const resend = new Resend(resendApiKey);

  /*
   * Stripe webhook verification requires the untouched request body.
   * Do not replace this with req.json().
   */
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Stripe signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 }
    );
  }

  try {
    /*
     * Ignore webhook events that this route does not need.
     */
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({
        received: true,
        ignored: event.type,
      });
    }

    const session = event.data.object;

    /*
     * Do not send the fulfillment email until Stripe confirms
     * that the Checkout Session has been paid.
     */
    if (session.payment_status !== "paid") {
      console.log(
        `Checkout Session ${session.id} completed but is not paid.`
      );

      return NextResponse.json({ received: true });
    }

    /*
     * Retrieve the products purchased in this Checkout Session.
     */
    const lineItems = await stripe.checkout.sessions.listLineItems(
      session.id,
      {
        limit: 100,
      }
    );

    const customer = session.customer_details;

    const shippingDetails =
      session.collected_information?.shipping_details;

    const shippingAddress = shippingDetails?.address;

    const customerName =
      shippingDetails?.name ??
      customer?.name ??
      "Not provided";

    const itemsHtml = lineItems.data
      .map((item) => {
        const quantity = item.quantity ?? 1;
        const total = formatMoney(item.amount_total);

        return `
          <tr>
            <td
              style="
                padding: 12px;
                border-bottom: 1px solid #ded8cf;
              "
            >
              ${escapeHtml(item.description ?? "Herbalur product")}
            </td>

            <td
              style="
                padding: 12px;
                border-bottom: 1px solid #ded8cf;
                text-align: center;
              "
            >
              ${quantity}
            </td>

            <td
              style="
                padding: 12px;
                border-bottom: 1px solid #ded8cf;
                text-align: right;
              "
            >
              ${total}
            </td>
          </tr>
        `;
      })
      .join("");

    const addressHtml = shippingAddress
      ? `
        ${escapeHtml(shippingAddress.line1)}<br />

        ${
          shippingAddress.line2
            ? `${escapeHtml(shippingAddress.line2)}<br />`
            : ""
        }

        ${escapeHtml(shippingAddress.city)},
        ${escapeHtml(shippingAddress.state)}
        ${escapeHtml(shippingAddress.postal_code)}<br />

        ${escapeHtml(shippingAddress.country)}
      `
      : "No shipping address was provided.";

    const orderReference = session.id.slice(-10).toUpperCase();

    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      subject: `New Herbalur Order — ${orderReference}`,

      html: `
        <div
          style="
            margin: 0 auto;
            max-width: 680px;
            padding: 32px;
            background: #faf7f2;
            color: #2d382f;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <p
            style="
              margin: 0 0 10px;
              color: #a3742b;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 2px;
              text-transform: uppercase;
            "
          >
            New Paid Order
          </p>

          <h1
            style="
              margin: 0 0 8px;
              font-family: Georgia, serif;
              font-size: 32px;
              font-weight: 400;
            "
          >
            An order is ready to prepare
          </h1>

          <p style="margin: 0 0 30px; color: #4d504a;">
            Stripe has confirmed payment for this order.
          </p>

          <div
            style="
              margin-bottom: 24px;
              padding: 20px;
              background: #f0e8dc;
            "
          >
            <h2
              style="
                margin: 0 0 12px;
                font-family: Georgia, serif;
                font-size: 20px;
              "
            >
              Customer
            </h2>

            <p style="margin: 4px 0;">
              <strong>Name:</strong>
              ${escapeHtml(customerName)}
            </p>

            <p style="margin: 4px 0;">
              <strong>Email:</strong>
              ${escapeHtml(customer?.email ?? "Not provided")}
            </p>

            <p style="margin: 4px 0;">
              <strong>Phone:</strong>
              ${escapeHtml(customer?.phone ?? "Not provided")}
            </p>
          </div>

          <div
            style="
              margin-bottom: 24px;
              padding: 20px;
              background: #f0e8dc;
            "
          >
            <h2
              style="
                margin: 0 0 12px;
                font-family: Georgia, serif;
                font-size: 20px;
              "
            >
              Shipping Address
            </h2>

            <p style="margin: 0; line-height: 1.7;">
              ${addressHtml}
            </p>
          </div>

          <h2
            style="
              margin: 0 0 12px;
              font-family: Georgia, serif;
              font-size: 20px;
            "
          >
            Items
          </h2>

          <table
            style="
              width: 100%;
              margin-bottom: 26px;
              border-collapse: collapse;
              background: #ffffff;
            "
          >
            <thead>
              <tr style="background: #24452b; color: #faf7f2;">
                <th style="padding: 12px; text-align: left;">
                  Product
                </th>

                <th style="padding: 12px; text-align: center;">
                  Quantity
                </th>

                <th style="padding: 12px; text-align: right;">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div
            style="
              border-top: 1px solid #ded8cf;
              padding-top: 20px;
              text-align: right;
            "
          >
            <p style="margin: 6px 0;">
              Subtotal:
              <strong>
                ${formatMoney(session.amount_subtotal)}
              </strong>
            </p>

            <p style="margin: 6px 0;">
              Shipping:
              <strong>
                ${formatMoney(
                  session.total_details?.amount_shipping
                )}
              </strong>
            </p>

            <p style="margin: 12px 0 0; font-size: 20px;">
              Total paid:
              <strong>
                ${formatMoney(session.amount_total)}
              </strong>
            </p>
          </div>

          <div
            style="
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ded8cf;
              color: #4d504a;
              font-size: 13px;
            "
          >
            <p style="margin: 4px 0;">
              <strong>Order reference:</strong>
              ${escapeHtml(orderReference)}
            </p>

            <p style="margin: 4px 0;">
              <strong>Stripe Session:</strong>
              ${escapeHtml(session.id)}
            </p>
          </div>
        </div>
      `,
    });

    if (emailResult.error) {
      console.error(
        "Failed to send owner order email:",
        emailResult.error
      );

      /*
       * Returning a 500 response allows Stripe to retry
       * the webhook later.
       */
      return NextResponse.json(
        { error: "Unable to send fulfillment email." },
        { status: 500 }
      );
    }

    console.log(
      `Owner notification sent for Stripe Session ${session.id}.`
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}