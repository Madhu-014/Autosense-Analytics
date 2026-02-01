"use client";

import { useEffect } from "react";

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Don't trigger shortcuts when typing in input fields
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const matches =
          shortcut.key === key &&
          (shortcut.ctrl === undefined || shortcut.ctrl === ctrl) &&
          (shortcut.shift === undefined || shortcut.shift === shift) &&
          (shortcut.alt === undefined || shortcut.alt === alt);

        if (matches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Common keyboard shortcuts
export const SHORTCUTS = {
  UPLOAD: { key: "u", ctrl: true, description: "Upload file" },
  HELP: { key: "?", shift: true, description: "Show keyboard shortcuts" },
  CLOSE: { key: "escape", description: "Close modal/panel" },
  SAVE: { key: "s", ctrl: true, description: "Save/Export" },
  SEARCH: { key: "k", ctrl: true, description: "Search" },
  NEW: { key: "n", ctrl: true, description: "New analysis" },
};
