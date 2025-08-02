import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Share2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Reports() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-sm mx-auto pb-24"
    >
      <h1 className="text-2xl font-bold text-black dark:text-white mb-6">Reports & Sharing</h1>
      
      <div className="space-y-4">
        <Link href="/monthly">
          <Button
            variant="outline"
            className="w-full justify-between h-20 px-6 bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-black dark:text-white">View Monthly Report</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress over time</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Button>
        </Link>

        <Link href="/share">
          <Button
            variant="outline"
            className="w-full justify-between h-20 px-6 bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Share2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-black dark:text-white">Share Day</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Share your achievements</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}