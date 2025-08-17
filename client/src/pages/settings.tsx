import { Link } from "wouter";
import { motion } from "framer-motion";
import { Shield, MessageCircle, ChevronRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Settings() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'en';
  });

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem('app-language', value);
    // In a real app, this would trigger a language change
    // For now, we'll just store the preference
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-sm mx-auto pb-24"
    >
      <h1 className="text-2xl font-bold text-black dark:text-white mb-6">Settings</h1>
      
      <div className="space-y-4">
        {/* Language Section */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-black dark:text-white">Language</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred language</p>
            </div>
          </div>
          
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="ko">한국어</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/privacy">
          <Button
            variant="outline"
            className="w-full justify-between h-20 px-6 bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-black dark:text-white">Privacy Policy</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">How we protect your data</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Button>
        </Link>

        <Link href="/contact">
          <Button
            variant="outline"
            className="w-full justify-between h-20 px-6 bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-black dark:text-white">Contact Us</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get help or send feedback</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}