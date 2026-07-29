"use client";

import { useEffect, useState } from "react";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    async function enableMocking() {
      // In production, we typically don't want MSW, but since this is a frontend-only demo 
      // without a real backend yet, we'll force it to run.
      const { worker } = await import("../mocks/browser");
      await worker.start({
        onUnhandledRequest: "bypass",
      });
      setMswReady(true);
    }

    enableMocking();
  }, []);

  if (!mswReady) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
