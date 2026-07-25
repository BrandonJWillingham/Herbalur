import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

type CartRequestItem = {
  id: string;
  quantity: number;
};

const MAX_ITEM_QUANTITY = 20;

function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not configured.");
  }

  // Prevent accidental double slashes in redirect/image URLs.
  return siteUrl.replace(/\/$/, "");
}

function getAbsoluteImageUrl(imageUrl: string | null, siteUrl: string) {
  if (!imageUrl) {
    return undefined;
  }

  // Stripe requires publicly accessible absolute image URLs.
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${siteUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

export async function POST(req: NextRequest) {
  try {
    const siteUrl = getSiteUrl();
    const body: unknown = await req.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("cart" in body) ||
      !Array.isArray(body.cart)
    ) {
      return NextResponse.json(
        { error: "Invalid checkout request." },
        { status: 400 }
      );
    }

    const rawCart = body.cart as unknown[];

    if (rawCart.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    /*
     * Validate the client input.
     *
     * We trust the client to send product IDs and quantities,
     * but we never trust client-side names, inventory, or prices.
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
          { error: "One or more cart items are invalid." },
          { status: 400 }
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
          { status: 400 }
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
     * This prevents someone from bypassing the quantity limit by sending
     * the same product multiple times in the request.
     */
    const quantityByProductId = new Map<string, number>();

    for (const item of validatedCart) {
      const existingQuantity = quantityByProductId.get(item.id) ?? 0;
      const combinedQuantity = existingQuantity + item.quantity;

      if (combinedQuantity > MAX_ITEM_QUANTITY) {
        return NextResponse.json(
          {
            error: `You may purchase no more than ${MAX_ITEM_QUANTITY} units of one product at a time.`,
          },
          { status: 400 }
        );
      }

      quantityByProductId.set(item.id, combinedQuantity);
    }

    const productIds = Array.from(quantityByProductId.keys());

    /*
     * Load the authoritative product information from PostgreSQL.
     * Prices sent from the browser are intentionally ignored.
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
     * Every requested product must exist.
     */
    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          error:
            "One or more products in your cart are no longer available. Please refresh your cart.",
        },
        { status: 400 }
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      products.map((product) => {
        const quantity = quantityByProductId.get(product.id);

        if (!quantity) {
          throw new Error(`Missing cart quantity for product ${product.id}.`);
        }

        /*
         * Check current inventory before creating Checkout.
         * Inventory should also be checked/reduced in the webhook later.
         */
        if (product.inventory < quantity) {
          throw new Error(
            `INSUFFICIENT_INVENTORY:${product.name}:${product.inventory}`
          );
        }

        const absoluteImageUrl = getAbsoluteImageUrl(
          product.imageUrl,
          siteUrl
        );

        return {
          quantity,

          price_data: {
            currency: "usd",
            unit_amount: product.price,

            product_data: {
              name: product.name,

              description: product.description
                ? product.description.slice(0, 500)
                : undefined,

              images: absoluteImageUrl ? [absoluteImageUrl] : undefined,

              /*
               * This makes the internal Prisma product ID available
               * when Stripe returns the completed line item later.
               */
              metadata: {
                productId: product.id,
              },
            },
          },
        };
      });

    /*
     * Stripe Checkout collects:
     * - Customer email
     * - Customer name
     * - Shipping address
     * - Phone number
     * - Payment information
     */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: lineItems,

      /*
       * Create a reusable Stripe Customer containing the details
       * entered during Checkout.
       */
      customer_creation: "always",

      billing_address_collection: "auto",

      shipping_address_collection: {
        // Herbalur currently ships within the United States.
        allowed_countries: ["US"],
      },

      phone_number_collection: {
        enabled: true,
      },

      /*
       * Ask Stripe to collect and save the customer's name.
       */
      customer_update: {
        name: "auto",
        address: "auto",
        shipping: "auto",
      },

      /*
       * This text appears near the Checkout submit button.
       */
      custom_text: {
        submit: {
          message:
            "Your shipping details will be used to prepare and deliver your Herbalur order.",
        },
      },

      /*
       * The success page is only for the customer experience.
       * The webhook will be responsible for creating and fulfilling the order.
       */
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,

      /*
       * You are using a cart drawer instead of a dedicated cart page,
       * so canceling returns the customer to the website.
       */
      cancel_url: `${siteUrl}/`,

      metadata: {
        source: "herbalur-cart",
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL.");
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout session error:", error);

    if (
      error instanceof Error &&
      error.message.startsWith("INSUFFICIENT_INVENTORY:")
    ) {
      const [, productName, remainingInventory] = error.message.split(":");

      return NextResponse.json(
        {
          error: `${productName} only has ${remainingInventory} remaining in stock.`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to begin checkout. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}