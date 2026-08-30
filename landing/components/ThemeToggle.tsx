"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const theme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = theme;
    try {
      localStorage.setItem("tuck-theme", theme);
    } catch {}
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle color theme" title="Toggle color theme">
      <span className="show-light" aria-hidden="true"><SunIcon size={18} weight="regular" /></span>
      <span className="show-dark" aria-hidden="true"><MoonIcon size={18} weight="regular" /></span>
    </button>
  );
}
