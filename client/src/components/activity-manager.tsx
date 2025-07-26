import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Plus, Trash2, Dumbbell, BookOpen, Brain, Code, 
  Coffee, Music, Palette, Camera, Heart, Utensils,
  Car, Home, Clock, Calendar, Target, Trophy, Star, 
  Zap, Briefcase, GraduationCap, Gamepad2, Smartphone, 
  Laptop, Headphones, Mic, Film, Scissors, Paintbrush, 
  Pen, Users, User, Baby, Dog, Trees, Sun, Mountain, 
  Waves, Flower, Settings, MessageCircle, Phone, Play,
  Radio, ShoppingCart, TrendingUp, Calculator, Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { Activity } from "@shared/schema";

interface ActivityManagerProps {
  activities: Activity[];
}

const iconOptions = [
  // Fitness & Health
  { value: "dumbbell", icon: Dumbbell, label: "Gym/Exercise", category: "Fitness" },
  { value: "heart", icon: Heart, label: "Health", category: "Fitness" },
  { value: "target", icon: Target, label: "Goals", category: "Fitness" },
  
  // Learning & Work
  { value: "book-open", icon: BookOpen, label: "Reading", category: "Learning" },
  { value: "brain", icon: Brain, label: "Meditation", category: "Learning" },
  { value: "code", icon: Code, label: "Coding", category: "Learning" },
  { value: "graduation-cap", icon: GraduationCap, label: "Study", category: "Learning" },
  { value: "briefcase", icon: Briefcase, label: "Work", category: "Learning" },
  { value: "pen", icon: Pen, label: "Writing", category: "Learning" },
  { value: "calculator", icon: Calculator, label: "Math", category: "Learning" },
  
  // Creative
  { value: "palette", icon: Palette, label: "Art", category: "Creative" },
  { value: "camera", icon: Camera, label: "Photography", category: "Creative" },
  { value: "music", icon: Music, label: "Music", category: "Creative" },
  { value: "paintbrush", icon: Paintbrush, label: "Painting", category: "Creative" },
  { value: "scissors", icon: Scissors, label: "Crafts", category: "Creative" },
  { value: "mic", icon: Mic, label: "Recording", category: "Creative" },
  { value: "film", icon: Film, label: "Video", category: "Creative" },
  
  // Daily Life
  { value: "coffee", icon: Coffee, label: "Coffee", category: "Daily" },
  { value: "utensils", icon: Utensils, label: "Cooking", category: "Daily" },
  { value: "home", icon: Home, label: "Housework", category: "Daily" },
  { value: "shopping-cart", icon: ShoppingCart, label: "Shopping", category: "Daily" },
  { value: "car", icon: Car, label: "Driving", category: "Daily" },
  { value: "phone", icon: Phone, label: "Calls", category: "Daily" },
  
  // Entertainment
  { value: "gamepad-2", icon: Gamepad2, label: "Gaming", category: "Entertainment" },
  { value: "headphones", icon: Headphones, label: "Podcasts", category: "Entertainment" },
  { value: "play", icon: Play, label: "Videos", category: "Entertainment" },
  { value: "radio", icon: Radio, label: "Radio", category: "Entertainment" },
  
  // Social & Family
  { value: "users", icon: Users, label: "Social", category: "Social" },
  { value: "user", icon: User, label: "Personal", category: "Social" },
  { value: "baby", icon: Baby, label: "Childcare", category: "Social" },
  { value: "message-circle", icon: MessageCircle, label: "Chat", category: "Social" },
  
  // Nature & Outdoors
  { value: "trees", icon: Trees, label: "Nature", category: "Nature" },
  { value: "mountain", icon: Mountain, label: "Hiking", category: "Nature" },
  { value: "waves", icon: Waves, label: "Swimming", category: "Nature" },
  { value: "sun", icon: Sun, label: "Sunshine", category: "Nature" },
  { value: "flower", icon: Flower, label: "Gardening", category: "Nature" },
  { value: "dog", icon: Dog, label: "Pet Care", category: "Nature" },
  
  // Technology
  { value: "smartphone", icon: Smartphone, label: "Phone", category: "Tech" },
  { value: "laptop", icon: Laptop, label: "Computer", category: "Tech" },
  { value: "settings", icon: Settings, label: "Tech Setup", category: "Tech" },
  
  // Time & Planning
  { value: "clock", icon: Clock, label: "Time", category: "Planning" },
  { value: "calendar", icon: Calendar, label: "Schedule", category: "Planning" },
  { value: "bookmark", icon: Bookmark, label: "Planning", category: "Planning" },
  
  // Achievement
  { value: "trophy", icon: Trophy, label: "Achievement", category: "Goals" },
  { value: "star", icon: Star, label: "Excellence", category: "Goals" },
  { value: "zap", icon: Zap, label: "Energy", category: "Goals" },
  { value: "trending-up", icon: TrendingUp, label: "Progress", category: "Goals" },
  
  // General
  { value: "plus", icon: Plus, label: "Other", category: "General" },
];

export default function ActivityManager({ activities }: ActivityManagerProps) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityIcon, setNewActivityIcon] = useState("plus");

  const createActivityMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string }) => {
      return apiRequest("POST", "/api/activities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setNewActivityName("");
      setNewActivityIcon("plus");
      setShowAddForm(false);
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
  });

  const handleAddActivity = () => {
    if (newActivityName.trim()) {
      createActivityMutation.mutate({
        name: newActivityName.trim(),
        icon: newActivityIcon,
      });
    }
  };

  const handleDeleteActivity = (id: string) => {
    deleteActivityMutation.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white ml-[3px] mr-[3px]">Activities</h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white text-black hover:bg-gray-200"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border border-gray-600 rounded-lg p-4 bg-black space-y-3"
        >
          <Input
            placeholder="Activity name (e.g., Exercise, Reading)"
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            className="bg-black border-gray-600 text-white"
          />
          <Select value={newActivityIcon} onValueChange={setNewActivityIcon}>
            <SelectTrigger className="bg-black border-gray-600 text-white">
              <SelectValue>
                {newActivityIcon && (
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const selectedIcon = iconOptions.find(opt => opt.value === newActivityIcon);
                      if (selectedIcon) {
                        const IconComponent = selectedIcon.icon;
                        return (
                          <>
                            <IconComponent className="w-4 h-4" />
                            <span>{selectedIcon.label}</span>
                          </>
                        );
                      }
                      return <span>Select icon</span>;
                    })()}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-black border-gray-600 max-h-96 overflow-y-auto">
              {Object.entries(iconOptions.reduce((acc, option) => {
                if (!acc[option.category]) acc[option.category] = [];
                acc[option.category].push(option);
                return acc;
              }, {} as Record<string, typeof iconOptions>)).map(([category, options]) => (
                <div key={category}>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-800">
                    {category}
                  </div>
                  {options.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-800">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </div>
              ))}
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Button
              onClick={handleAddActivity}
              disabled={!newActivityName.trim() || createActivityMutation.isPending}
              className="bg-white text-black hover:bg-gray-200 flex-1"
            >
              Add Activity
            </Button>
            <Button
              onClick={() => setShowAddForm(false)}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}
      <div className="space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-2 border border-gray-600 rounded-lg bg-black"
          >
            <span className="text-white font-medium">{activity.name}</span>
            <Button
              onClick={() => handleDeleteActivity(activity.id)}
              disabled={deleteActivityMutation.isPending}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}