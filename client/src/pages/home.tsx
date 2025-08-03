import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Stickman from "@/components/stickman";
import ProgressCircle from "@/components/progress-circle";
import ActivityItem from "@/components/activity-item";
import ActivityManager from "@/components/activity-manager";

import { calculateProductivityScore } from "@/lib/scoring";
import { getDailyQuote } from "@/lib/quotes";
import type { DailyEntry, Activity, ActivityCompletion } from "@shared/schema";
import { Trophy, Clock } from "lucide-react";

export default function Home() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const [reflection, setReflection] = useState("");

  // Fetch today's daily entry
  const { data: dailyEntry, isLoading: loadingEntry } = useQuery<DailyEntry>({
    queryKey: ["/api/daily-entry", today],
    enabled: true,
  });

  // Fetch user activities
  const { data: activities = [], isLoading: loadingActivities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    enabled: true,
  });

  // Fetch activity completions
  const { data: completions = [], isLoading: loadingCompletions } = useQuery<ActivityCompletion[]>({
    queryKey: ["/api/daily-entry", dailyEntry?.id, "completions"],
    enabled: !!dailyEntry?.id,
  });

  // Fetch user streak
  const { data: streak } = useQuery<{ currentStreak: number; longestStreak: number }>({
    queryKey: ["/api/streak"],
    enabled: true,
  });

  // Update reflection mutation
  const updateReflectionMutation = useMutation({
    mutationFn: async (newReflection: string) => {
      if (!dailyEntry?.id) return;
      return apiRequest("PATCH", `/api/daily-entry/${dailyEntry.id}`, {
        reflection: newReflection,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/daily-entry", today]
      });
    },
  });

  // Finalize day mutation
  const finalizeDayMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/finalize-day/${today}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/daily-entry", today]
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/streak"]
      });
      // Show success message or redirect to next day
    },
  });

  // Undo finalize mutation
  const undoFinalizeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/undo-finalize/${today}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/daily-entry", today]
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/streak"]
      });
    },
  });

  // Auto-finalize at midnight if not already finalized
  useEffect(() => {
    const checkAutoFinalize = async () => {
      if (!dailyEntry || dailyEntry.isFinalized) return;
      
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight
      
      const timeUntilMidnight = midnight.getTime() - now.getTime();
      
      // If it's already past midnight for today's entry, auto-finalize
      if (timeUntilMidnight <= 0) {
        try {
          await apiRequest("POST", `/api/auto-finalize/${today}`, {});
          queryClient.invalidateQueries({
            queryKey: ["/api/daily-entry", today]
          });
          queryClient.invalidateQueries({
            queryKey: ["/api/streak"]
          });
        } catch (error) {
          // Silently handle auto-finalize errors
        }
      } else {
        // Set timer for auto-finalization at midnight
        const timer = setTimeout(async () => {
          try {
            await apiRequest("POST", `/api/auto-finalize/${today}`, {});
            queryClient.invalidateQueries({
              queryKey: ["/api/daily-entry", today]
            });
            queryClient.invalidateQueries({
              queryKey: ["/api/streak"]
            });
          } catch (error) {
            // Silently handle auto-finalize errors
          }
        }, timeUntilMidnight);
        
        return () => clearTimeout(timer);
      }
    };
    
    checkAutoFinalize();
  }, [dailyEntry, today]);

  // Calculate score whenever completions change - memoized for performance
  const score = useMemo(() => {
    return calculateProductivityScore({
      completions,
      activities,
      currentStreak: streak?.currentStreak || 0,
    });
  }, [completions, activities, streak?.currentStreak]);

  // Update reflection on change
  useEffect(() => {
    if (dailyEntry?.reflection && reflection !== dailyEntry.reflection) {
      setReflection(dailyEntry.reflection);
    }
  }, [dailyEntry?.reflection]);

  // Debounced reflection update - reduced delay for faster feedback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (reflection !== dailyEntry?.reflection) {
        updateReflectionMutation.mutate(reflection);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [reflection]);

  const dailyQuote = getDailyQuote();

  if (loadingEntry || loadingActivities) {
    return (
      <div className="p-6 space-y-8">
        <div className="text-center pt-8">
          <div className="h-8 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-4 bg-white dark:bg-black text-black dark:text-white min-h-screen pb-24"
    >
      {/* Header */}
      <div className="text-center pt-8">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">ProdScale</h1>
        <div className="text-lg font-medium text-black dark:text-white mb-1">
          {new Date(today).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        <p className="text-sm italic text-gray-600 dark:text-gray-400">"{dailyQuote}"</p>
      </div>
      {/* Circular Progress Meter with Score */}
      <div className="text-center relative mb-4">
        <ProgressCircle score={dailyEntry?.isFinalized ? (dailyEntry.score || 0) : score} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-black dark:text-white">
            {dailyEntry?.isFinalized ? (dailyEntry.score || 0).toFixed(1) : score.toFixed(1)}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">/10</span>
        </div>
      </div>
      {/* Stickman Mascot */}
      <div className="flex justify-center -mt-8 mb-8">
        <Stickman score={dailyEntry?.isFinalized ? (dailyEntry.score || 0) : score} size="large" />
      </div>
      {/* Activity Management Section */}
      <div className="space-y-6 mt-8">
        <ActivityManager activities={activities} />
        
        {/* Today's Activities Check-in */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-black dark:text-white ml-[3px] mr-[3px]">Today's Check-in</h2>
          <div className="space-y-3">
            {activities.map((activity: Activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                dailyEntryId={dailyEntry?.id}
                completion={completions.find((c: ActivityCompletion) => c.activityId === activity.id)}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Reflection Box */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold ml-[3px] mr-[3px] text-black dark:text-white">Daily Reflection</h2>
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="resize-none focus:border-black dark:focus:border-white transition-colors bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-600"
          rows={3}
          placeholder="How did today go? What did you learn?"
        />
      </div>
      {/* Bottom Buttons */}
      <div className="space-y-3 pt-4">
        {!dailyEntry?.isFinalized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              onClick={() => finalizeDayMutation.mutate()}
              disabled={finalizeDayMutation.isPending}
              className="w-full h-14 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold text-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {finalizeDayMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white dark:border-black border-t-transparent"></div>
                  <span>Finalizing Day...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Finalize Day</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </Button>
          </motion.div>
        )}
        {dailyEntry?.isFinalized && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="w-full"
          >
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-2xl shadow-lg relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-black dark:bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-black dark:bg-white rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="text-center mb-4">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200
                    }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white rounded-full mb-3 shadow-lg"
                  >
                    <svg className="w-8 h-8 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-black dark:text-white">
                      Day Complete! 🎉
                    </h3>
                    <div className="flex items-center justify-center space-x-4 text-black dark:text-white">
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-5 h-5" />
                        <span className="font-semibold text-lg">Score: {dailyEntry.score || 0}/10</span>
                      </div>
                      {dailyEntry.autoFinalized && (
                        <div className="text-sm opacity-80 flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Auto-finalized</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Achievement Message */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {(dailyEntry.score || 0) >= 9 ? "Legendary performance! You crushed it today!" :
                       (dailyEntry.score || 0) >= 7 ? "Great job! You had a productive day!" :
                       (dailyEntry.score || 0) >= 5 ? "Good work! Every step counts!" :
                       "Progress made! Tomorrow is a new opportunity!"}
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => undoFinalizeMutation.mutate()}
                  disabled={undoFinalizeMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 border-gray-400 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-all font-medium"
                >
                  {undoFinalizeMutation.isPending ? "Undoing..." : "Undo Finalization"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
