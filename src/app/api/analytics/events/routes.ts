// src/app/api/analytics/events/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { getVisitor } from "@/lib/analytics/getVisitor";
import { getOrCreateSession } from "@/lib/analytics/session";

const SESSION_COOKIE = "session_id";

const EVENT_TYPES = [
  "PAGE_VIEW",
  "PRODUCT_VIEW",
  "CATEGORY_VIEW",
  "ADD_TO_CART",
  "REMOVE_FROM_CART",
  "BEGIN_CHECKOUT",
  "PURCHASE",
  "NEWSLETTER_SIGNUP",
] as const;

type EventType = (typeof EVENT_TYPES)[number];

function isValidEventType(value: unknown): value is EventType {
  return (
    typeof value === "string" &&
    EVENT_TYPES.includes(value as EventType)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      type,
      page,
      productId,
      metadata,
    } = body;

    //
    // 1. Validate event type
    //

    if (!isValidEventType(type)) {
      return NextResponse.json(
        {
          error: "Invalid event type.",
        },
        {
          status: 400,
        }
      );
    }

    //
    // 2. Resolve Visitor from HttpOnly visitor_id cookie
    //

    const visitor = await getVisitor();

    if (!visitor) {
      return NextResponse.json(
        {
          error: "Visitor not initialized.",
        },
        {
          status: 400,
        }
      );
    }

    //
    // 3. Resolve current browsing session
    //

    const cookieStore = await cookies();

    const existingSessionId =
      cookieStore.get(SESSION_COOKIE)?.value;

    const session = await getOrCreateSession(
      visitor.id,
      existingSessionId
    );

    //
    // 4. Validate product if this event references one
    //

    if (productId) {
      const productExists =
        await prisma.product.findUnique({
          where: {
            id: productId,
          },
          select: {
            id: true,
          },
        });

      if (!productExists) {
        return NextResponse.json(
          {
            error: "Product not found.",
          },
          {
            status: 400,
          }
        );
      }
    }

    //
    // 5. Prevent huge arbitrary metadata payloads
    //

    if (metadata) {
      const metadataSize =
        JSON.stringify(metadata).length;

      if (metadataSize > 10_000) {
        return NextResponse.json(
          {
            error: "Metadata is too large.",
          },
          {
            status: 400,
          }
        );
      }
    }

    //
    // 6. Store event
    //

    await prisma.event.create({
      data: {
        type,
        page:
          typeof page === "string"
            ? page
            : null,

        productId:
          typeof productId === "string"
            ? productId
            : null,

        metadata: metadata ?? undefined,

        visitorId: visitor.id,
        sessionId: session.id,

        // Later, when authentication exists:
        // userId: authenticatedUser?.id ?? null,
      },
    });

    //
    // 7. Keep Visitor activity timestamp fresh
    //

    await prisma.visitor.update({
      where: {
        id: visitor.id,
      },
      data: {
        lastSeenAt: new Date(),
      },
    });

    //
    // 8. Create response
    //

    const response = NextResponse.json({
      success: true,
    });

    //
    // If getOrCreateSession created a new session,
    // replace the old session_id cookie.
    //

    if (session.id !== existingSessionId) {
      response.cookies.set(
        SESSION_COOKIE,
        session.id,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24,
        }
      );
    }

    return response;
  } catch (error) {
    console.error(
      "Failed to record analytics event:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}