"use client";

import { useState, useEffect } from "react";

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || process.env.NODE_ENV === "production") return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg"
      >
        🛠
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-lg p-4">
          <h3 className="font-bold text-lg mb-4">GoAuct DevTools</h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-zinc-500 mb-2">Simulators</h4>
              <button className="w-full text-left p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                Toggle 500 Error
              </button>
              <button className="w-full text-left p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                Add +2s Latency
              </button>
            </div>
            
            <div>
              <h4 className="font-semibold text-zinc-500 mb-2">Feature Flags</h4>
              <label className="flex items-center space-x-2 p-2">
                <input type="checkbox" defaultChecked />
                <span>New Routing UI</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
