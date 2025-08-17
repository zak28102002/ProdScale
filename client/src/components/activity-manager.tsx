import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Plus, Trash2, ChevronRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Activity, User } from "@shared/schema";

interface ActivityManagerProps {
  activities: Activity[];
}

const emojiCategories = {
  'Activities': [
    '🎯', '🎪', '🎨', '🎬', '🎤', '🎧', '🎵', '🎸',
    '🎹', '🥁', '🎷', '🎺', '🎻', '🎭', '🩰', '🎮',
    '🎯', '🎲', '🎰', '🎳', '🎱', '🎾', '🏀', '⚽',
    '🏈', '⚾', '🥎', '🏐', '🏉', '🥏', '🎿', '⛷️',
    '🏂', '🏋️', '🤸', '🤹', '🤺', '🤼', '🤽', '🏊',
    '🚴', '🚵', '🏇', '🧘', '🏄', '🏃', '🤾', '🥊'
  ],
  'Sports & Fitness': [
    '💪', '🏃‍♂️', '🏃‍♀️', '🤸‍♀️', '🤸‍♂️', '🏋️‍♂️', '🏋️‍♀️', '⚡',
    '🔥', '💯', '🎾', '🏀', '⚽', '🏈', '⚾', '🥎',
    '🏐', '🏉', '🥏', '🛹', '🛼', '⛸️', '🥌', '🏒',
    '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹',
    '🎣', '🤿', '🥊', '🥋', '🎱', '🏓', '🏸', '🏆'
  ],
  'Food & Beverages': [
    '☕', '🍳', '🥘', '🍲', '🥗', '🍱', '🍙', '🍚',
    '🍛', '🍜', '🦪', '🍣', '🍤', '🍕', '🍔', '🍟',
    '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚',
    '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌶️',
    '🥒', '🥬', '🥦', '🧄', '🧅', '🥕', '🌽', '🥔'
  ],
  'Art & Creative': [
    '🎨', '🖼️', '🖌️', '🖍️', '✏️', '✒️', '🖋️', '🖊️',
    '📝', '💼', '📁', '📂', '🗂️', '📅', '📆', '📇',
    '📈', '📉', '📊', '📋', '📌', '📍', '📎', '📏',
    '📐', '✂️', '🖇️', '🗃️', '🗄️', '🔨', '🪛', '🔧',
    '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗', '⛓️', '🪝'
  ],
  'Nature': [
    '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀',
    '🍁', '🍂', '🍃', '🌺', '🌻', '🌹', '🥀', '🌷',
    '🌸', '🌼', '🌵', '🪴', '🪷', '🪸', '🪹', '🪺',
    '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐈', '🐈‍⬛', '🦜',
    '🦋', '🐛', '🦟', '🪰', '🪲', '🪳', '🦗', '🕷️'
  ],
  'Technology': [
    '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💾', '💿', '📀',
    '📱', '☎️', '📞', '📟', '📠', '📺', '📻', '📹',
    '📷', '📸', '🎥', '📽️', '🎞️', '💡', '🔦', '🕯️',
    '🪔', '🔌', '🔋', '🪫', '📡', '⚡', '🔧', '🔨'
  ],
  'Travel & Places': [
    '🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🧭', '🏔️',
    '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️',
    '🏟️', '🏛️', '🏗️', '🧱', '🏘️', '🏚️', '🏠', '🏡',
    '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪',
    '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽'
  ],
  'General': [
    '➕', '✨', '🌟', '⭐', '💫', '🌈', '🔮', '💎',
    '💰', '🪙', '💵', '💴', '💶', '💷', '🪪', '💳',
    '🎁', '🎀', '🎊', '🎉', '🎈', '🪅', '🪆', '🎏',
    '🎎', '🏮', '🪔', '✨', '🎆', '🎇', '🧨', '🎄'
  ]
};

export default function ActivityManager({ activities }: ActivityManagerProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityIcon, setNewActivityIcon] = useState("➕");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Activities");
  
  // Check user Pro status
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

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
    onError: (error: any) => {
      toast({
        title: "Cannot add more activities",
        description: error.message || "Free users can only have up to 3 activities. Upgrade to Pro for unlimited activities!",
        variant: "destructive",
      });
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
        icon: newActivityIcon, // Now stores the emoji directly
      });
    }
  };

  const handleDeleteActivity = (id: string) => {
    deleteActivityMutation.mutate(id);
  };

  const canAddMore = user?.isPro || activities.length < 3;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black dark:text-white ml-[3px] mr-[3px]">Activities</h3>
        {canAddMore ? (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        ) : (
          <Link href="/pro">
            <Button
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700"
              size="sm"
            >
              <Crown className="w-4 h-4 mr-1" />
              Upgrade
            </Button>
          </Link>
        )}
      </div>
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border border-gray-600 dark:border-gray-600 border-gray-300 rounded-lg p-4 bg-white dark:bg-black space-y-3"
        >
          <Input
            placeholder="Activity name (e.g., Exercise, Reading)"
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            className="bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-black dark:text-white"
          />
          
          {/* Custom Emoji Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-full px-3 py-2 text-left bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <span className="text-2xl">{newActivityIcon}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showEmojiPicker ? 'rotate-90' : ''}`} />
            </button>
            
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute z-50 w-full mt-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden"
              >
                {/* Category Tabs */}
                <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 scrollbar-hide">
                  {Object.keys(emojiCategories).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === category 
                          ? 'text-black dark:text-white bg-white dark:bg-black border-b-2 border-black dark:border-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                {/* Emoji Grid */}
                <motion.div 
                  key={selectedCategory}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="p-3 max-h-64 overflow-y-auto"
                >
                  <div className="grid grid-cols-8 gap-1">
                    {emojiCategories[selectedCategory as keyof typeof emojiCategories].map((emoji, index) => (
                      <motion.button
                        key={`${emoji}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          delay: index * 0.01,
                          duration: 0.2,
                          ease: "easeOut"
                        }}
                        onClick={() => {
                          setNewActivityIcon(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-2 text-2xl hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition-colors transform hover:scale-110"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleAddActivity}
              disabled={!newActivityName.trim() || createActivityMutation.isPending}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 flex-1"
            >
              Add Activity
            </Button>
            <Button
              onClick={() => setShowAddForm(false)}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
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
            className="flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black"
          >
            <span className="text-black dark:text-white font-medium">{activity.name}</span>
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