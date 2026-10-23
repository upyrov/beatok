import { Menu } from "@base-ui/react";
import { Moon, Sun } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

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
      className="system-popup-item w-full flex items-center gap-2"
      onClick={() => {
        toggleTheme();
      }}
    >
      {theme === "light" ? (
        <Moon className="text-lg" />
      ) : (
        <Sun className="text-lg" />
      )}
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </Menu.Item>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="text-lg" />
      ) : (
        <Sun className="text-lg" />
      )}
    </Button>
  );
}
