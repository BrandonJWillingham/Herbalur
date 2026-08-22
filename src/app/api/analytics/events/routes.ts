// app/api/analytics/event/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { anon_id, type, page, metadata } = await req.json();

    if (!anon_id || !type) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Find or create this anonymous visitor
    const user = await prisma.userData.upsert({
      where: {
        anon_id,
      },
      update: {
        lastSeen: new Date(),
      },
      create: {
        anon_id,
      },
    });

    // Store the event
    await prisma.event.create({
      data: {
        type,
        page,
        metadata,
        userDataId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}