import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Dumbbell, BookOpen, Brain, Code, Plus,
  Coffee, Music, Palette, Camera, Heart, Utensils,
  Car, Home, Clock, Calendar, Target, Trophy, Star, 
  Zap, Briefcase, GraduationCap, Gamepad2, Smartphone, 
  Laptop, Headphones, Mic, Film, Scissors, Paintbrush, 
  Pen, Users, User, Baby, Dog, Trees, Sun, Mountain, 
  Waves, Flower, Settings, MessageCircle, Phone, Play,
  Radio, ShoppingCart, TrendingUp, Calculator, Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { Activity, ActivityCompletion } from "@shared/schema";

interface ActivityItemProps {
  activity: Activity;
  dailyEntryId?: string;
  completion?: ActivityCompletion;
}

const iconMap = {
  // Fitness & Health
  dumbbell: Dumbbell,
  heart: Heart,
  target: Target,
  
  // Learning & Work
  "book-open": BookOpen,
  brain: Brain,
  code: Code,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  pen: Pen,
  calculator: Calculator,
  
  // Creative
  palette: Palette,
  camera: Camera,
  music: Music,
  paintbrush: Paintbrush,
  scissors: Scissors,
  mic: Mic,
  film: Film,
  
  // Daily Life
  coffee: Coffee,
  utensils: Utensils,
  home: Home,
  "shopping-cart": ShoppingCart,
  car: Car,
  phone: Phone,
  
  // Entertainment
  "gamepad-2": Gamepad2,
  headphones: Headphones,
  play: Play,
  radio: Radio,
  
  // Social & Family
  users: Users,
  user: User,
  baby: Baby,
  "message-circle": MessageCircle,
  
  // Nature & Outdoors
  trees: Trees,
  mountain: Mountain,
  waves: Waves,
  sun: Sun,
  flower: Flower,
  dog: Dog,
  
  // Technology
  smartphone: Smartphone,
  laptop: Laptop,
  settings: Settings,
  
  // Time & Planning
  clock: Clock,
  calendar: Calendar,
  bookmark: Bookmark,
  
  // Achievement
  trophy: Trophy,
  star: Star,
  zap: Zap,
  "trending-up": TrendingUp,
  
  // General
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
      className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black"
    >
      <div className="flex items-center space-x-3">
        <IconComponent className="w-5 h-5 text-black dark:text-white" />
        <span className="font-medium text-black dark:text-white">{activity.name}</span>
      </div>
      <Button
        onClick={handleToggle}
        disabled={toggleCompletionMutation.isPending}
        className={`w-8 h-8 rounded-full text-sm p-0 ${
          isCompleted
            ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            : "border-2 border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        {isCompleted && "✓"}
      </Button>
    </motion.div>
  );
}
