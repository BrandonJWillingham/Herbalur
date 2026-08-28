// src/components/VisitorInitializer.tsx

"use client";

import { useEffect } from "react";

export default function VisitorInitializer() {
  useEffect(() => {
    async function initializeVisitor() {
      try {
        const response = await fetch("/api/analytics/visitor", {
          method: "POST",
        });

        if (!response.ok) {
          console.error("Failed to initialize visitor");
        }
      } catch (error) {
        console.error(
          "Failed to initialize visitor:",
          error
        );
      }
    }

    initializeVisitor();
  }, []);

  return null;
}