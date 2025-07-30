import type { Activity, ActivityCompletion } from "@shared/schema";

interface ScoringParams {
  completions: ActivityCompletion[];
  activities: Activity[];
  currentStreak: number;
}

export function calculateProductivityScore({
  completions,
  activities,
  currentStreak,
}: ScoringParams): number {
  // Only count activities that have corresponding completions
  const relevantCompletions = completions.filter(c => 
    activities.some(a => a.id === c.activityId)
  );
  
  const completedActivities = relevantCompletions.filter(c => c.completed === true);
  const totalActivities = activities.length;
  
  if (totalActivities === 0) return 0;
  
  // Base score: purely proportional to completion percentage (0-10 points)
  const completionRatio = completedActivities.length / totalActivities;
  let score = completionRatio * 10;
  
  // Bonus points for streak (but only if not already at 10):
  if (score < 10 && currentStreak >= 3) {
    // +1 point for streak (3+ days)
    score += 1;
  }
  
  // Ensure score is between 0 and 10
  return Math.min(Math.max(Math.round(score * 10) / 10, 0), 10);
}
