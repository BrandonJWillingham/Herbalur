// src/lib/analytics/getVisitors.ts

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "visitor_id";

export async function getVisitor() {
  const cookieStore = await cookies();

  const visitorId =
    cookieStore.get(VISITOR_COOKIE)?.value;

  // Browser has not been initialized yet
  if (!visitorId) {
    return null;
  }

  // Look up the Visitor represented by the cookie
  const visitor = await prisma.visitor.findUnique({
    where: {
      id: visitorId,
    },
  });

  return visitor;
}