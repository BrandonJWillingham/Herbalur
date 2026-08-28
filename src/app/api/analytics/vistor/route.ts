// src/app/api/visitor/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { getOrCreateSession } from "@/lib/analytics/session";

const VISITOR_COOKIE = "visitor_id";
const SESSION_COOKIE = "session_id";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST() {
  try {
    const cookieStore = await cookies();

    let visitorId =
      cookieStore.get(VISITOR_COOKIE)?.value;

    const existingSessionId =
      cookieStore.get(SESSION_COOKIE)?.value;

    let visitor = null;

    //
    // 1. Resolve existing Visitor
    //

    if (visitorId) {
      visitor = await prisma.visitor.findUnique({
        where: {
          id: visitorId,
        },
      });
    }

    //
    // 2. Create Visitor if necessary
    //

    if (!visitor) {
      visitor = await prisma.visitor.create({
        data: {},
      });

      visitorId = visitor.id;
    } else {
      await prisma.visitor.update({
        where: {
          id: visitor.id,
        },
        data: {
          lastSeenAt: new Date(),
        },
      });
    }

    //
    // 3. Resolve or create browsing Session
    //

    const session = await getOrCreateSession(
      visitor.id,
      existingSessionId
    );

    //
    // 4. Create response
    //

    const response = NextResponse.json({
      success: true,
    });

    //
    // 5. Store browser identity
    //

    response.cookies.set(
      VISITOR_COOKIE,
      visitor.id,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ONE_YEAR,
      }
    );

    //
    // 6. Store current session
    //

    response.cookies.set(
      SESSION_COOKIE,
      session.id,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",

        // Cookie can live longer than the session.
        // DB inactivity determines true expiration.
        maxAge: 60 * 60 * 24,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Failed to initialize visitor/session:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to initialize visitor session",
      },
      {
        status: 500,
      }
    );
  }
}