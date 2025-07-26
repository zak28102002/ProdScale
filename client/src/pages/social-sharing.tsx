import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Instagram, Twitter, Facebook, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDailyQuote } from "@/lib/quotes";
import { calculateProductivityScore } from "@/lib/scoring";
import { useToast } from "@/hooks/use-toast";
import type { DailyEntry, Activity, ActivityCompletion } from "@shared/schema";

export default function SocialSharing() {
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's data
  const { data: dailyEntry } = useQuery<DailyEntry>({
    queryKey: ["/api/daily-entry", today],
    enabled: true,
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    enabled: true,
  });

  const { data: completions = [] } = useQuery<ActivityCompletion[]>({
    queryKey: ["/api/daily-entry", dailyEntry?.id, "completions"],
    enabled: !!dailyEntry?.id,
  });

  const { data: streak } = useQuery<{ currentStreak: number; longestStreak: number }>({
    queryKey: ["/api/streak"],
    enabled: true,
  });

  const score = calculateProductivityScore({
    completions,
    activities,
    currentStreak: streak?.currentStreak || 0,
  });

  const completedActivities = completions.filter(c => c.completed);
  const dailyQuote = getDailyQuote();

  // Create engaging share text based on achievement level
  const getShareText = () => {
    let achievementText = "";
    let emoji = "";
    
    if (score >= 9) {
      achievementText = "🏆 LEGENDARY productivity day!";
      emoji = "🔥";
    } else if (score >= 7) {
      achievementText = "🌟 Champion level performance!";
      emoji = "💪";
    } else if (score >= 5) {
      achievementText = "⚡ Warrior mode activated!";
      emoji = "🎯";
    } else if (score >= 3) {
      achievementText = "🌱 Rising to the challenge!";
      emoji = "📈";
    } else {
      achievementText = "🎯 Starting my journey!";
      emoji = "🚀";
    }
    
    const streakText = (streak?.currentStreak || 0) > 0 ? `\n🔥 ${streak?.currentStreak} day streak!` : "";
    
    return `${achievementText}\n\n${emoji} Scored ${score.toFixed(1)}/10 on ProdScale${streakText}\n✅ Completed ${completedActivities.length} activities\n\n💭 "${dailyQuote}"\n\n#ProdScale #ProductivityGoals #DailyWins`;
  };
  
  const shareText = getShareText();

  const handleShare = (platform: string) => {
    let url = '';
    const encodedText = encodeURIComponent(shareText);
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodedText}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL, so we'll copy to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard!",
          description: "Share text copied. Paste it in your Instagram post.",
        });
        return;
      case 'copy':
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard!",
          description: "Share text copied successfully.",
        });
        return;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleSaveImage = () => {
    // In a real app, this would generate and save an image
    toast({
      title: "Feature coming soon!",
      description: "Image saving will be available in the next update.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Share Progress</h1>
        <div className="w-9"></div>
      </div>

      {/* Share Card Preview */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-black rounded-xl p-6 text-white space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">ProdScale</h2>
          <div className="text-2xl font-bold">
            {score.toFixed(1)}<span className="text-sm opacity-70">/10</span>
          </div>
        </div>
        
        <div className="text-center py-4">
          <div className="relative mx-auto w-24 h-24 mb-3">
            {/* Circular progress indicator */}
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(score / 10) * 251.2} 251.2`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{score.toFixed(1)}</span>
            </div>
          </div>
          
          {/* Achievement Badge */}
          <div className="mb-3">
            {score >= 9 && (
              <div className="inline-flex items-center px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-bold">
                🏆 Legendary
              </div>
            )}
            {score >= 7 && score < 9 && (
              <div className="inline-flex items-center px-3 py-1 bg-green-400 text-black rounded-full text-sm font-bold">
                🌟 Champion
              </div>
            )}
            {score >= 5 && score < 7 && (
              <div className="inline-flex items-center px-3 py-1 bg-blue-400 text-black rounded-full text-sm font-bold">
                💪 Warrior
              </div>
            )}
            {score >= 3 && score < 5 && (
              <div className="inline-flex items-center px-3 py-1 bg-purple-400 text-black rounded-full text-sm font-bold">
                🌱 Rising
              </div>
            )}
            {score < 3 && (
              <div className="inline-flex items-center px-3 py-1 bg-gray-400 text-black rounded-full text-sm font-bold">
                🎯 Starter
              </div>
            )}
          </div>
          
          {/* Streak Display */}
          {(streak?.currentStreak || 0) > 0 && (
            <div className="text-sm text-white opacity-90 mb-2">
              🔥 {streak?.currentStreak} day streak!
            </div>
          )}
          
          <div className="flex items-center justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < Math.ceil(score / 2) ? 'bg-white' : 'bg-white bg-opacity-30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-medium">Today's Wins:</p>
          <div className="flex flex-wrap gap-2">
            {completedActivities.map((completion) => {
              const activity = activities.find(a => a.id === completion.activityId);
              return activity ? (
                <span key={completion.id} className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs">
                  {activity.name} ✓
                </span>
              ) : null;
            })}
            {dailyEntry?.reflection && (
              <span className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs">
                Reflection ✓
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-white border-opacity-20 pt-3">
          <p className="text-sm italic opacity-80">"{dailyQuote}"</p>
        </div>

        {/* Challenge Friends */}
        <div className="border-t border-white border-opacity-20 pt-3">
          <p className="text-xs opacity-80">
            {score >= 7 ? "🎯 Can your friends beat this?" : "🚀 Join me on the productivity journey!"}
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs opacity-60">Made with ProdScale</p>
        </div>
      </motion.div>

      {/* Export Options */}
      <div className="space-y-3">
        <h3 className="font-semibold">Share to:</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleShare('instagram')}
            className="flex items-center justify-center space-x-2 p-3 hover:bg-gray-50"
          >
            <Instagram className="w-5 h-5" />
            <span>Instagram</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleShare('twitter')}
            className="flex items-center justify-center space-x-2 p-3 hover:bg-gray-50"
          >
            <Twitter className="w-5 h-5" />
            <span>Twitter</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleShare('facebook')}
            className="flex items-center justify-center space-x-2 p-3 hover:bg-gray-50"
          >
            <Facebook className="w-5 h-5" />
            <span>Facebook</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleShare('copy')}
            className="flex items-center justify-center space-x-2 p-3 hover:bg-gray-50"
          >
            <Copy className="w-5 h-5" />
            <span>Copy Link</span>
          </Button>
        </div>
      </div>

      {/* Motivational Quick Share Buttons */}
      <div className="space-y-3">
        <h3 className="font-semibold">Quick Share Templates:</h3>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const quickText = score >= 7 
                ? "🏆 Crushing my productivity goals today! Who else is leveling up? #ProductivityChallenge #ProdScale"
                : "🌱 Building better habits one day at a time! Join me on this journey! #ProductivityJourney #ProdScale";
              navigator.clipboard.writeText(quickText);
              toast({
                title: "Challenge text copied!",
                description: "Ready to inspire your friends!",
              });
            }}
            className="text-left justify-start p-3 h-auto"
          >
            <div>
              <div className="font-medium">
                {score >= 7 ? "🏆 Challenge Friends" : "🌱 Inspire Others"}
              </div>
              <div className="text-xs opacity-60">
                {score >= 7 ? "Show off your achievement" : "Share your journey"}
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Save to Camera Roll */}
      <Button
        onClick={handleSaveImage}
        className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
      >
        Save to Camera Roll
      </Button>
    </motion.div>
  );
}
