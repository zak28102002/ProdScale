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
  let score = 0;
  
  const completedActivities = completions.filter(c => c.completed);
  const totalActivities = activities.length;
  
  // +3 points if all selected activities were done
  if (completedActivities.length === totalActivities && totalActivities > 0) {
    score += 3;
  }
  // +2 points if more than 3 activities completed
  else if (completedActivities.length >= 3) {
    score += 2;
  }
  
  // +2 points if reflection was added
  if (hasReflection) {
    score += 2;
  }
  
  // +2 points if user hit a 3+ day streak
  if (currentStreak >= 3) {
    score += 2;
  }
  
  // Base score for partial completion (1-3 points based on completion ratio)
  const completionRatio = totalActivities > 0 ? completedActivities.length / totalActivities : 0;
  score += Math.floor(completionRatio * 3);
  
  // Ensure score is between 0 and 10
  return Math.min(Math.max(score, 0), 10);
}
