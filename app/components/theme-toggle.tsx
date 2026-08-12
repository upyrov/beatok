import { Button, Menu } from "@base-ui/react";
import { useCallback, useEffect, useState } from "react";
import { CgMoon, CgSun } from "react-icons/cg";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
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

  return { theme, toggleTheme };
}

export function ThemeToggleMenuItem() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Menu.Item
      className="system-popup-item w-full flex items-center gap-2 cursor-pointer"
      onClick={() => {
        toggleTheme();
      }}
    >
      {theme === "light" ? (
        <CgMoon className="text-lg" />
      ) : (
        <CgSun className="text-lg" />
      )}
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </Menu.Item>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-black/10 dark:bg-white/10 transition-colors text-gray-700 dark:text-gray-300 outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <CgMoon size={20} /> : <CgSun size={20} />}
    </Button>
  );
}
