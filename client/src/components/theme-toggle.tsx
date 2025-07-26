import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className={`fixed top-4 right-4 z-50 rounded-full w-12 h-12 p-0 transition-all duration-300 ${
        theme === "dark"
          ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600' 
          : 'bg-gray-200 hover:bg-gray-300 text-black border border-gray-300'
      }`}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </Button>
  );
}