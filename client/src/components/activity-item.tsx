import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Dumbbell, BookOpen, Brain, Code, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [duration, setDuration] = useState(completion?.duration?.toString() || "");
  
  const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || Plus;
  const isCompleted = completion?.completed || false;

  const toggleCompletionMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      if (!dailyEntryId) return;
      
      if (completion) {
        // Update existing completion
        return apiRequest("PATCH", `/api/activity-completion/${completion.id}`, {
          completed,
          duration: duration ? parseInt(duration) : null,
          completedAt: completed ? new Date().toISOString() : null,
        });
      } else {
        // Create new completion
        return apiRequest("POST", "/api/activity-completion", {
          dailyEntryId,
          activityId: activity.id,
          completed,
          duration: duration ? parseInt(duration) : null,
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
      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
    >
      <div className="flex items-center space-x-3">
        <IconComponent className="w-5 h-5 text-accent" />
        <span className="font-medium">{activity.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          placeholder="30"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-12 text-xs p-1 text-center"
          disabled={isCompleted}
        />
        <span className="text-xs text-accent">min</span>
        <Button
          onClick={handleToggle}
          disabled={toggleCompletionMutation.isPending}
          className={`w-6 h-6 rounded-full text-xs p-0 ${
            isCompleted
              ? "bg-black text-white hover:bg-secondary"
              : "border-2 border-gray-300 bg-transparent text-black hover:bg-gray-50"
          }`}
        >
          {isCompleted && "✓"}
        </Button>
      </div>
    </motion.div>
  );
}
