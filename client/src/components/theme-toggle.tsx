import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true); // Default to dark theme

  useEffect(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    // Apply the theme to the document
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-black text-white min-h-screen';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-white text-black min-h-screen';
    }
    
    // Save theme preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className={`fixed top-4 right-4 z-50 rounded-full w-12 h-12 p-0 transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600' 
          : 'bg-gray-200 hover:bg-gray-300 text-black border border-gray-300'
      }`}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </Button>
  );
}