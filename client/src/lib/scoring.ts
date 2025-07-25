import type { Activity, ActivityCompletion } from "@shared/schema";

interface ScoringParams {
  completions: ActivityCompletion[];
  activities: Activity[];
  hasReflection: boolean;
  currentStreak: number;
}

export function calculateProductivityScore({
  completions,
  activities,
  hasReflection,
  currentStreak,
}: ScoringParams): number {
  const completedActivities = completions.filter(c => c.completed);
  const totalActivities = activities.length;
  
  if (totalActivities === 0) return 0;
  
  // Base score: purely proportional to completion percentage (0-10 points)
  const completionRatio = completedActivities.length / totalActivities;
  let score = completionRatio * 10;
  
  // Bonus points for extras (but only if not already at 10):
  if (score < 10) {
    // +1 point for reflection
    if (hasReflection) {
      score += 1;
    }
    
    // +1 point for streak (3+ days)
    if (currentStreak >= 3) {
      score += 1;
    }
  }
  
  // Ensure score is between 0 and 10
  return Math.min(Math.max(score, 0), 10);
}
