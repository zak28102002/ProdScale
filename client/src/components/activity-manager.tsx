import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Trash2, Dumbbell, BookOpen, Brain, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { Activity } from "@shared/schema";

interface ActivityManagerProps {
  activities: Activity[];
}

const iconOptions = [
  { value: "dumbbell", icon: Dumbbell, label: "Gym" },
  { value: "book-open", icon: BookOpen, label: "Reading" },
  { value: "brain", icon: Brain, label: "Meditation" },
  { value: "code", icon: Code, label: "Learning" },
  { value: "plus", icon: Plus, label: "Other" },
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
        <h3 className="text-lg font-semibold text-white">Activities</h3>
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-gray-600">
              {iconOptions.map((option) => {
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
            {!activity.isDefault && (
              <Button
                onClick={() => handleDeleteActivity(activity.id)}
                disabled={deleteActivityMutation.isPending}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}