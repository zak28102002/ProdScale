import { useState, useEffect } from "react";
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
import ThemeToggle from "@/components/theme-toggle";
import { calculateProductivityScore } from "@/lib/scoring";
import { getDailyQuote } from "@/lib/quotes";
import type { DailyEntry, Activity, ActivityCompletion } from "@shared/schema";

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
          console.error("Auto-finalize error:", error);
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
            console.error("Auto-finalize error:", error);
          }
        }, timeUntilMidnight);
        
        return () => clearTimeout(timer);
      }
    };
    
    checkAutoFinalize();
  }, [dailyEntry, today]);

  // Calculate score whenever completions change
  const score = calculateProductivityScore({
    completions,
    activities,
    currentStreak: streak?.currentStreak || 0,
  });

  // Update reflection on change
  useEffect(() => {
    if (dailyEntry?.reflection && reflection !== dailyEntry.reflection) {
      setReflection(dailyEntry.reflection);
    }
  }, [dailyEntry?.reflection]);

  // Debounced reflection update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (reflection !== dailyEntry?.reflection) {
        updateReflectionMutation.mutate(reflection);
      }
    }, 500);

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
    <>
      <ThemeToggle />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-4 bg-white dark:bg-black text-black dark:text-white min-h-screen"
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
          <Button 
            onClick={() => finalizeDayMutation.mutate()}
            disabled={finalizeDayMutation.isPending}
            className="w-full bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600"
          >
            {finalizeDayMutation.isPending ? "Finalizing..." : "Finalize Day"}
          </Button>
        )}
        {dailyEntry?.isFinalized && (
          <div className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-xl shadow-sm">
            <div className="text-center mb-3">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full mb-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-green-800 dark:text-green-200">
                <div className="font-semibold text-lg">Day Finalized</div>
                <div className="text-sm opacity-90">
                  Final Score: {dailyEntry.score}/10
                  {dailyEntry.autoFinalized && " • Auto-finalized"}
                </div>
              </div>
            </div>
            <Button 
              onClick={() => undoFinalizeMutation.mutate()}
              disabled={undoFinalizeMutation.isPending}
              variant="outline"
              size="sm"
              className="w-full border-green-600 text-green-700 hover:bg-green-100 dark:border-green-400 dark:text-green-300 dark:hover:bg-green-900 transition-colors"
            >
              {undoFinalizeMutation.isPending ? "Undoing..." : "Undo Finalization"}
            </Button>
          </div>
        )}
        <Link href="/monthly">
          <Button variant="outline" className="w-full border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black mt-[5px] mb-[5px]">
            View Monthly Report
          </Button>
        </Link>
        <Link href="/share">
          <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
            Share Day
          </Button>
        </Link>
      </div>
    </motion.div>
    </>
  );
}
