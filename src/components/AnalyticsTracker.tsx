"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const page = query ? `${pathname}?${query}` : pathname;

    fetch("/api/analytics/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "PAGE_VIEW",
        page,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => {
      // Don't break the site if analytics fails.
    });
  }, [pathname, searchParams]);

  return null;
}


export function trackEvent(
  type: string,
  metadata?: Record<string, unknown>
) {
  fetch("/api/analytics/event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      page: window.location.pathname,
      metadata,
    }),
    keepalive: true,
  }).catch(() => {});
}