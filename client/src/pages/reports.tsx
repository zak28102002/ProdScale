import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Share2, ChevronRight, TrendingUp, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { DailyEntry } from "@shared/schema";

export default function Reports() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Fetch current month data for preview
  const { data: monthlyData } = useQuery<{
    entries: DailyEntry[];
    average: number;
    isUnproductive: boolean;
  }>({
    queryKey: ["/api/monthly", currentYear, currentMonth],
  });

  // Fetch today's entry for share preview
  const { data: todayEntry } = useQuery<DailyEntry>({
    queryKey: ["/api/daily-entry", today.toISOString().split('T')[0]],
  });

  const daysTracked = monthlyData?.entries?.length || 0;
  const monthlyAverage = monthlyData?.average || 0;
  const todayScore = todayEntry?.score || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-sm mx-auto pb-24"
    >
      <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Reports & Sharing</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Track progress and celebrate wins</p>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl text-center"
        >
          <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{monthlyAverage}</div>
          <div className="text-xs text-purple-600 dark:text-purple-400">Avg Score</div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl text-center"
        >
          <Star className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-green-800 dark:text-green-200">{daysTracked}</div>
          <div className="text-xs text-green-600 dark:text-green-400">Days Tracked</div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl text-center"
        >
          <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{todayScore.toFixed(1)}</div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">Today</div>
        </motion.div>
      </div>
      
      <div className="space-y-4">
        <Link href="/monthly">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full justify-between h-24 px-6 bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-black dark:text-white text-lg">Monthly Report</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View calendar and trends</p>
                  {monthlyAverage > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {new Date().toLocaleDateString('en-US', { month: 'long' })} average: {monthlyAverage}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </Link>

        <Link href="/share">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full justify-between h-24 px-6 bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Share2 className="w-7 h-7 text-green-600 dark:text-green-300" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-black dark:text-white text-lg">Share Day</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create beautiful cards</p>
                  {todayScore > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Today's score: {todayScore.toFixed(1)}/10
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </Link>
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {monthlyAverage >= 8 ? "🌟 Outstanding month! Keep up the amazing work!" :
           monthlyAverage >= 6 ? "💪 Great progress! You're on the right track!" :
           monthlyAverage >= 4 ? "🌱 Good start! Every day counts!" :
           "🎯 Track daily to see your progress!"}
        </p>
      </motion.div>
    </motion.div>
  );
}