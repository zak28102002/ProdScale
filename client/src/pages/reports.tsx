import { Link } from "wouter";
import { motion } from "framer-motion";
import { Castle, Swords, ChevronRight, Shield, Award, Crown, Flame, Target, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DailyEntry, Streak } from "@shared/schema";

export default function Reports() {
  const { t } = useLanguage();
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

  // Fetch streak data
  const { data: streakData } = useQuery<Streak>({
    queryKey: ["/api/streak"],
  });

  // Fetch last 7 days for weekly chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const { data: weeklyEntries } = useQuery<DailyEntry[]>({
    queryKey: ["/api/weekly-entries", last7Days[0], last7Days[6]],
    queryFn: async () => {
      const promises = last7Days.map(date => 
        fetch(`/api/daily-entry/${date}`).then(res => res.ok ? res.json() : null)
      );
      const results = await Promise.all(promises);
      return results.filter(Boolean);
    }
  });

  // Only count days that have been actually tracked (finalized or have score > 0)
  const daysTracked = monthlyData?.entries?.filter(entry => entry.isFinalized || (entry.score !== null && entry.score > 0)).length || 0;
  const monthlyAverage = monthlyData?.average || 0;
  const todayScore = todayEntry?.score || 0;
  const currentStreak = streakData?.currentStreak || 0;

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
          className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl text-center border border-gray-200 dark:border-gray-800"
        >
          <Shield className="w-6 h-6 text-black dark:text-white mx-auto mb-1" />
          <div className="text-2xl font-bold text-black dark:text-white">{monthlyAverage}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{t('avgScore')}</div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center border border-gray-200 dark:border-gray-700"
        >
          <Crown className="w-6 h-6 text-black dark:text-white mx-auto mb-1" />
          <div className="text-2xl font-bold text-black dark:text-white">{daysTracked}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{t('daysTracked')}</div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-black p-4 rounded-xl text-center border border-gray-300 dark:border-gray-600"
        >
          <Award className="w-6 h-6 text-black dark:text-white mx-auto mb-1" />
          <div className="text-2xl font-bold text-black dark:text-white">{todayScore.toFixed(1)}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{t('today')}</div>
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
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Castle className="w-7 h-7 text-black dark:text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-black dark:text-white text-lg">{t('monthlyReport')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('viewCalendarAndTrends')}</p>
                  {monthlyAverage > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Swords className="w-7 h-7 text-black dark:text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-black dark:text-white text-lg">{t('shareDay')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('createBeautifulCards')}</p>
                  {todayScore > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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

      {/* Weekly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl"
      >
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <Sword className="w-4 h-4 mr-2" />
          {t('last7Days')}
        </h3>
        <div className="flex items-end justify-between h-20 space-x-1">
          {last7Days.map((date, index) => {
            const entry = weeklyEntries?.find(e => e.date === date);
            const score = entry?.score || 0;
            const height = score > 0 ? (score / 10) * 100 : 2; // Minimal height for 0 scores
            const isToday = date === today.toISOString().split('T')[0];
            
            return (
              <div key={date} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center h-16">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className={`w-full rounded-t ${
                      score >= 8 ? 'bg-black dark:bg-white' :
                      score >= 6 ? 'bg-gray-800 dark:bg-gray-200' :
                      score >= 4 ? 'bg-gray-600 dark:bg-gray-400' :
                      score > 0 ? 'bg-gray-400 dark:bg-gray-600' :
                      'bg-gray-200 dark:bg-gray-800' // Gray base for 0 scores
                    }`}
                  />
                </div>
                <div className={`text-xs mt-1 ${isToday ? 'font-bold text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })[0]}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Streak & Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 grid grid-cols-2 gap-3"
      >
        {/* Current Streak */}
        <div className="p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-6 h-6 text-black dark:text-white" />
            <span className="text-2xl font-bold text-black dark:text-white">{currentStreak}</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">{t('currentStreak')}</p>
          {currentStreak >= 7 && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('onFire')}</p>
          )}
        </div>

        {/* Personal Best */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-black dark:text-white" />
            <span className="text-2xl font-bold text-black dark:text-white">
              {streakData?.longestStreak || 0}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">{t('bestStreak')}</p>
          {(streakData?.longestStreak || 0) >= 30 && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('legend')}</p>
          )}
        </div>
      </motion.div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
      >
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Insights</h3>
        <div className="space-y-2">
          {monthlyAverage > 0 && monthlyData?.entries && monthlyData.entries.length > 0 && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              • Your best day this month was {
                monthlyData.entries.reduce((best, entry) => 
                  (entry.score || 0) > (best.score || 0) ? entry : best, 
                  monthlyData.entries[0]
                )?.score?.toFixed(1) || "0.0"
              }/10
            </p>
          )}
          {currentStreak >= 3 && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              • You've been consistent for {currentStreak} days straight!
            </p>
          )}
          {daysTracked > 0 && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              • You've tracked {daysTracked} {daysTracked === 1 ? 'day' : 'days'} this month ({((daysTracked / new Date().getDate()) * 100).toFixed(0)}%)
            </p>
          )}
        </div>
      </motion.div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {monthlyAverage >= 8 ? t('outstandingMonth') :
           monthlyAverage >= 6 ? t('greatProgress') :
           monthlyAverage >= 4 ? t('goodStart') :
           t('trackDaily')}
        </p>
      </motion.div>
    </motion.div>
  );
}