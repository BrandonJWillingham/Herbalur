// src/lib/analytics/session.ts

import { prisma } from "@/lib/prisma";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export async function getOrCreateSession(
  visitorId: string,
  existingSessionId?: string
) {
  if (existingSessionId) {
    const session = await prisma.session.findUnique({
      where: {
        id: existingSessionId,
      },
    });

    if (
      session &&
      session.visitorId === visitorId
    ) {
      const inactiveFor =
        Date.now() - session.lastSeenAt.getTime();

      // Session is still active
      if (inactiveFor < SESSION_TIMEOUT_MS) {
        return prisma.session.update({
          where: {
            id: session.id,
          },
          data: {
            lastSeenAt: new Date(),
          },
        });
      }

      // Old session has expired
      await prisma.session.update({
        where: {
          id: session.id,
        },
        data: {
          endedAt: session.lastSeenAt,
        },
      });
    }
  }

  // No session or previous session expired
  return prisma.session.create({
    data: {
      visitorId,
    },
  });
}