import { useCallback, useEffect, useState } from "react";
import { CgMoon, CgSun } from "react-icons/cg";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check initial theme from localStorage or default to light
    const savedTheme = localStorage.getItem("theme");
    // As per user request, default is light mode. We will ignore system preference if no saved theme, to enforce day mode default.
    const initialTheme = savedTheme === "dark" ? "dark" : "light";
    setTheme(initialTheme);

    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-300 outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <CgMoon size={20} /> : <CgSun size={20} />}
    </button>
  );
}
