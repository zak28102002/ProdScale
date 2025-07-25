import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Instagram, Twitter, Facebook, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Stickman from "@/components/stickman";
import { getDailyQuote } from "@/lib/quotes";
import { calculateProductivityScore } from "@/lib/scoring";
import { useToast } from "@/hooks/use-toast";

export default function SocialSharing() {
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's data
  const { data: dailyEntry } = useQuery({
    queryKey: ["/api/daily-entry", today],
    enabled: true,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["/api/activities"],
    enabled: true,
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["/api/daily-entry", dailyEntry?.id, "completions"],
    enabled: !!dailyEntry?.id,
  });

  const { data: streak } = useQuery({
    queryKey: ["/api/streak"],
    enabled: true,
  });

  const score = calculateProductivityScore({
    completions,
    activities,
    hasReflection: !!dailyEntry?.reflection?.trim(),
    currentStreak: streak?.currentStreak || 0,
  });

  const completedActivities = completions.filter(c => c.completed);
  const dailyQuote = getDailyQuote();

  const shareText = `I scored ${score.toFixed(1)}/10 on ProdScale today! 🎯\n\n✅ Completed ${completedActivities.length} activities\n💭 "${dailyQuote}"\n\n#ProdScale #Productivity`;

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
        
        <div className="text-center">
          <div className="stickman mx-auto mb-3 invert">
            <Stickman score={score} inverted />
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

      {/* Save to Camera Roll */}
      <Button
        onClick={handleSaveImage}
        className="w-full bg-black text-white hover:bg-secondary"
      >
        Save to Camera Roll
      </Button>
    </motion.div>
  );
}
