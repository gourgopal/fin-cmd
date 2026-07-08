"use client";

import React from "react";

export function AskAiButton() {
  const handleClick = () => {
    // Dispatch Cmd+K to open NLP modal
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
      })
    );
  };

  return (
    <button
      onClick={handleClick}
      className="px-6 py-3 rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-secondary)] transition-colors"
    >
      Ask AI Assistant
    </button>
  );
}
