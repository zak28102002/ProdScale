import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Dumbbell, BookOpen, Brain, Code, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { Activity, ActivityCompletion } from "@shared/schema";

interface ActivityItemProps {
  activity: Activity;
  dailyEntryId?: string;
  completion?: ActivityCompletion;
}

const iconMap = {
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  brain: Brain,
  code: Code,
  plus: Plus,
};

export default function ActivityItem({ activity, dailyEntryId, completion }: ActivityItemProps) {
  const queryClient = useQueryClient();
  
  const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || Plus;
  const isCompleted = completion?.completed || false;

  const toggleCompletionMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      if (!dailyEntryId) return;
      
      if (completion) {
        // Update existing completion
        return apiRequest("PATCH", `/api/activity-completion/${completion.id}`, {
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        });
      } else {
        // Create new completion
        return apiRequest("POST", "/api/activity-completion", {
          dailyEntryId,
          activityId: activity.id,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/daily-entry", dailyEntryId, "completions"]
      });
    },
  });

  const handleToggle = () => {
    toggleCompletionMutation.mutate(!isCompleted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-black"
    >
      <div className="flex items-center space-x-3">
        <IconComponent className="w-5 h-5 text-white" />
        <span className="font-medium text-white">{activity.name}</span>
      </div>
      <Button
        onClick={handleToggle}
        disabled={toggleCompletionMutation.isPending}
        className={`w-8 h-8 rounded-full text-sm p-0 ${
          isCompleted
            ? "bg-white text-black hover:bg-gray-200"
            : "border-2 border-gray-600 bg-transparent text-white hover:bg-gray-800"
        }`}
      >
        {isCompleted && "✓"}
      </Button>
    </motion.div>
  );
}
