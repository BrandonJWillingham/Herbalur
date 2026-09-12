import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

type CartRequestItem = {
  id: string;
  quantity: number;
};

const MAX_ITEM_QUANTITY = 20;

/**
 * Returns the base URL for redirects.
 *
 * Priority:
 * 1. SITE_URL
 * 2. NEXT_PUBLIC_SITE_URL
 * 3. Vercel deployment URL
 * 4. localhost during development
 */
function getSiteUrl() {
  const configuredUrl =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

/**
 * Stripe product images must use absolute URLs.
 *
 * During local development, Stripe cannot retrieve images from localhost,
 * so local image paths are omitted from the Checkout Session.
 */
function getAbsoluteImageUrl(
  imageUrl: string | null,
  siteUrl: string
): string | undefined {
  if (!imageUrl) {
    return undefined;
  }

  // Already publicly hosted.
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  // Stripe cannot access localhost assets.
  if (
    siteUrl.includes("localhost") ||
    siteUrl.includes("127.0.0.1")
  ) {
    return undefined;
  }

  const normalizedPath = imageUrl.startsWith("/")
    ? imageUrl
    : `/${imageUrl}`;

  return `${siteUrl}${normalizedPath}`;
}

export async function POST(req: NextRequest) {
  try {
    const siteUrl = getSiteUrl();

    /*
     * Parse JSON separately so bad JSON returns 400
     * instead of falling into the general 500 handler.
     */
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid checkout request.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate basic request shape.
     */
    if (
      !body ||
      typeof body !== "object" ||
      !("cart" in body) ||
      !Array.isArray(body.cart)
    ) {
      return NextResponse.json(
        {
          error: "Invalid checkout request.",
        },
        {
          status: 400,
        }
      );
    }

    const rawCart = body.cart as unknown[];

    if (rawCart.length === 0) {
      return NextResponse.json(
        {
          error: "Your cart is empty.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate every cart item.
     *
     * The client is allowed to tell us:
     * - which product
     * - how many
     *
     * The client is NOT trusted to tell us:
     * - price
     * - product name
     * - inventory
     */
    const validatedCart: CartRequestItem[] = [];

    for (const item of rawCart) {
      if (
        !item ||
        typeof item !== "object" ||
        !("id" in item) ||
        !("quantity" in item)
      ) {
        return NextResponse.json(
          {
            error: "One or more cart items are invalid.",
          },
          {
            status: 400,
          }
        );
      }

      const id = item.id;
      const quantity = item.quantity;

      if (
        typeof id !== "string" ||
        id.trim().length === 0 ||
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_ITEM_QUANTITY
      ) {
        return NextResponse.json(
          {
            error: `Each cart quantity must be between 1 and ${MAX_ITEM_QUANTITY}.`,
          },
          {
            status: 400,
          }
        );
      }

      validatedCart.push({
        id: id.trim(),
        quantity,
      });
    }

    /*
     * Combine duplicate product IDs.
     *
     * Example:
     *
     * [
     *   { id: "abc", quantity: 10 },
     *   { id: "abc", quantity: 15 }
     * ]
     *
     * should NOT bypass our 20-unit limit.
     */
    const quantityByProductId = new Map<string, number>();

    for (const item of validatedCart) {
      const existingQuantity =
        quantityByProductId.get(item.id) ?? 0;

      const combinedQuantity =
        existingQuantity + item.quantity;

      if (combinedQuantity > MAX_ITEM_QUANTITY) {
        return NextResponse.json(
          {
            error: `You may purchase no more than ${MAX_ITEM_QUANTITY} units of one product at a time.`,
          },
          {
            status: 400,
          }
        );
      }

      quantityByProductId.set(
        item.id,
        combinedQuantity
      );
    }

    const productIds = Array.from(
      quantityByProductId.keys()
    );

    /*
     * Load authoritative product data from PostgreSQL.
     *
     * This prevents users from changing the price in
     * their browser before sending the checkout request.
     */
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },

      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        inventory: true,
        imageUrl: true,
      },
    });

    /*
     * Every requested product must still exist.
     */
    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          error:
            "One or more products in your cart are no longer available. Please refresh your cart.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Build Stripe line items using DATABASE prices.
     */
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      products.map((product) => {
        const quantity =
          quantityByProductId.get(product.id);

        if (!quantity) {
          throw new Error(
            `Missing cart quantity for product ${product.id}.`
          );
        }

        /*
         * Check stock before sending the customer to Stripe.
         *
         * Your webhook should still perform the final
         * inventory handling after successful payment.
         */
        if (product.inventory < quantity) {
          throw new Error(
            `INSUFFICIENT_INVENTORY:${product.name}:${product.inventory}`
          );
        }

        const absoluteImageUrl =
          getAbsoluteImageUrl(
            product.imageUrl,
            siteUrl
          );

        return {
          quantity,

          price_data: {
            currency: "usd",

            /*
             * Your Product.price is stored in cents.
             *
             * Example:
             * 2500 = $25.00
             */
            unit_amount: product.price,

            product_data: {
              name: product.name,

              description: product.description
                ? product.description.slice(0, 500)
                : undefined,

              images: absoluteImageUrl
                ? [absoluteImageUrl]
                : undefined,

              /*
               * Preserve the Prisma Product ID
               * in Stripe.
               */
              metadata: {
                productId: product.id,
              },
            },
          },
        };
      });

    /*
     * Create Stripe Checkout Session.
     *
     * IMPORTANT:
     *
     * We use:
     *
     * customer_creation: "always"
     *
     * We DO NOT use customer_update here.
     *
     * customer_update is only valid if we provide an
     * existing Stripe customer:
     *
     * customer: "cus_..."
     */
    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        payment_method_types: ["card"],

        line_items: lineItems,

        /*
         * Stripe creates a Customer after checkout.
         *
         * This lets you associate repeat purchases
         * with Stripe customers later.
         */
        customer_creation: "always",

        /*
         * Stripe will collect the customer's email
         * during Checkout.
         */

        billing_address_collection: "auto",

        /*
         * Collect the shipping address.
         */
        shipping_address_collection: {
          allowed_countries: ["US"],
        },

        /*
         * Collect customer's phone number.
         */
        phone_number_collection: {
          enabled: true,
        },

        /*
         * Customer-facing message near the payment button.
         */
        custom_text: {
          submit: {
            message:
              "Your shipping details will be used to prepare and deliver your Herbalur order.",
          },
        },

        /*
         * Stripe replaces this placeholder with
         * the actual Checkout Session ID.
         */
        success_url:
          `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,

        /*
         * Herbalur uses a cart drawer, so returning
         * to the homepage makes sense when checkout
         * is canceled.
         */
        cancel_url: `${siteUrl}/`,

        /*
         * Session-level metadata.
         */
        metadata: {
          source: "herbalur-cart",
        },
      });

    if (!session.url) {
      throw new Error(
        "Stripe did not return a Checkout URL."
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "Checkout session error:",
      error
    );

    /*
     * Give the frontend a useful inventory message.
     */
    if (
      error instanceof Error &&
      error.message.startsWith(
        "INSUFFICIENT_INVENTORY:"
      )
    ) {
      const [
        ,
        productName,
        remainingInventory,
      ] = error.message.split(":");

      return NextResponse.json(
        {
          error: `${productName} only has ${remainingInventory} remaining in stock.`,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Don't expose Stripe/database internals
     * directly to the customer.
     */
    return NextResponse.json(
      {
        error:
          "Unable to begin checkout. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}