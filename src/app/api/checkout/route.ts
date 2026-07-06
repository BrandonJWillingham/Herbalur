import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {stripe} from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { cart } = await req.json();

    // Validate request
    if (!cart || cart.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty." },
        { status: 400 }
      );
    }

    // Find the products in your database
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: cart.map((item: { id: string }) => item.id),
        },
      },
    });

    // Create Stripe line items
    const lineItems = products.map((product) => {
      const cartItem = cart.find(
        (item: { id: string }) => item.id === product.id
      );

      return {
        price_data: {
          currency: "usd",

          product_data: {
            name: product.name,

            // optional
            images: product.imageUrl ? [product.imageUrl] : [],
          },

          unit_amount: product.price,
        },

        quantity: cartItem?.quantity ?? 1,
      };
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: lineItems,

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to create checkout session.",
      },
      {
        status: 500,
      }
    );
  }
}