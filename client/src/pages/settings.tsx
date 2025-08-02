import { Link } from "wouter";
import { motion } from "framer-motion";
import { Shield, MessageCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-sm mx-auto pb-24"
    >
      <h1 className="text-2xl font-bold text-black dark:text-white mb-6">Settings</h1>
      
      <div className="space-y-4">
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