import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Instagram, Twitter, Facebook, Copy, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDailyQuote } from "@/lib/quotes";
import { calculateProductivityScore } from "@/lib/scoring";
import { useToast } from "@/hooks/use-toast";
import * as htmlToImage from "html-to-image";
import type { DailyEntry, Activity, ActivityCompletion } from "@shared/schema";

interface Background {
  id: string;
  class: string;
  style?: React.CSSProperties;
}

const backgrounds: Background[] = [
  { id: 'black', class: 'bg-black' },
  { id: 'gradient1', class: 'bg-gradient-to-br from-purple-900 to-pink-700' },
  { id: 'gradient2', class: 'bg-gradient-to-br from-blue-900 to-cyan-700' },
  { id: 'gradient3', class: 'bg-gradient-to-br from-emerald-900 to-teal-700' },
  { id: 'gradient4', class: 'bg-gradient-to-br from-orange-900 to-red-700' },
  { id: 'gradient5', class: 'bg-gradient-to-br from-indigo-900 to-purple-700' },
  { id: 'gradient6', class: 'bg-gradient-to-br from-gray-900 to-gray-700' },
  { id: 'gradient7', class: 'bg-gradient-to-br from-pink-900 to-rose-700' },
  { id: 'gradient8', class: 'bg-gradient-to-tr from-yellow-900 to-amber-700' },
  { id: 'gradient9', class: 'bg-gradient-to-tr from-slate-900 to-zinc-700' },
  { id: 'gradient10', class: 'bg-gradient-to-tl from-violet-900 to-fuchsia-700' },
  { id: 'gradient11', class: 'bg-gradient-to-tl from-sky-900 to-blue-700' },
  { id: 'gradient12', class: 'bg-gradient-to-bl from-green-900 to-lime-700' },
  { id: 'pattern1', class: 'bg-gradient-to-br from-black via-gray-900 to-black' },
  { id: 'pattern2', class: 'bg-gradient-to-r from-black via-purple-900 to-black' },
  { id: 'mesh1', class: 'bg-gradient-to-br from-purple-900 to-black', style: { backgroundImage: 'radial-gradient(at 20% 80%, rgb(120, 20, 120) 0, transparent 50%), radial-gradient(at 80% 20%, rgb(20, 120, 120) 0, transparent 50%), radial-gradient(at 40% 40%, rgb(20, 20, 120) 0, transparent 50%)' } },
  { id: 'mesh2', class: 'bg-gradient-to-tr from-blue-900 to-black', style: { backgroundImage: 'radial-gradient(at 0% 0%, rgb(20, 50, 120) 0, transparent 50%), radial-gradient(at 100% 100%, rgb(120, 20, 50) 0, transparent 50%)' } },
  { id: 'cosmic', class: 'bg-gradient-to-br from-purple-900 via-blue-900 to-black', style: { backgroundImage: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.3), transparent), radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.3), transparent)' } },
  { id: 'aurora', class: 'bg-gradient-to-t from-green-900 via-emerald-900 to-black', style: { backgroundImage: 'linear-gradient(to top, rgba(16, 185, 129, 0.3), transparent), linear-gradient(115deg, rgba(59, 130, 246, 0.3), transparent)' } },
  { id: 'nebula', class: 'bg-gradient-to-br from-pink-900 via-purple-900 to-black', style: { backgroundImage: 'radial-gradient(at 30% 70%, rgba(236, 72, 153, 0.3), transparent 40%), radial-gradient(at 70% 30%, rgba(147, 51, 234, 0.3), transparent 40%)' } },
  { id: 'dots1', class: 'bg-gray-900', style: { backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' } },
  { id: 'waves1', class: 'bg-gradient-to-br from-blue-900 to-purple-900', style: { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)' } },
  { id: 'circuit', class: 'bg-gradient-to-br from-gray-900 to-black', style: { backgroundImage: 'linear-gradient(90deg, transparent 90%, rgba(255,255,255,.05) 100%), linear-gradient(transparent 90%, rgba(255,255,255,.05) 100%)', backgroundSize: '20px 20px' } },
  { id: 'hexagon', class: 'bg-gradient-to-br from-indigo-900 to-black', style: { backgroundImage: 'radial-gradient(circle at 20% 50%, transparent 30%, rgba(99, 102, 241, 0.2) 30.5%, rgba(99, 102, 241, 0.2) 31%, transparent 31.5%), radial-gradient(circle at 40% 50%, transparent 30%, rgba(99, 102, 241, 0.2) 30.5%, rgba(99, 102, 241, 0.2) 31%, transparent 31.5%)', backgroundSize: '50px 50px' } },
  { id: 'carbon', class: 'bg-gray-900', style: { backgroundImage: 'linear-gradient(27deg, #151515 5px, transparent 5px) 0 5px, linear-gradient(207deg, #151515 5px, transparent 5px) 10px 0px, linear-gradient(27deg, #222 5px, transparent 5px) 0px 10px, linear-gradient(207deg, #222 5px, transparent 5px) 10px 5px, linear-gradient(90deg, #1b1b1b 10px, transparent 10px), linear-gradient(#1d1d1d 25%, #1a1a1a 25%, #1a1a1a 50%, transparent 50%, transparent 75%, #242424 75%, #242424)', backgroundSize: '20px 20px' } },
];

export default function SocialSharing() {
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];
  const [selectedBg, setSelectedBg] = useState(backgrounds[0]);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

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

  const handleShare = async (platform: string) => {
    // First, save the image
    if (shareCardRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(shareCardRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: 'transparent',
          style: {
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }
        });
        
        // Create and trigger download
        const link = document.createElement('a');
        link.download = `prodscale-${today}-score-${score.toFixed(1)}.png`;
        link.href = dataUrl;
        link.click();
        
        // Show platform-specific instructions
        setTimeout(() => {
          let url = '';
          const encodedText = encodeURIComponent(shareText);
          
          switch (platform) {
            case 'twitter':
              url = `https://twitter.com/intent/tweet?text=${encodedText}`;
              toast({
                title: "Image saved! 📸",
                description: "Now attach the downloaded image to your tweet.",
              });
              window.open(url, '_blank', 'width=600,height=400');
              break;
            case 'facebook':
              url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodedText}`;
              toast({
                title: "Image saved! 📸",
                description: "Upload the downloaded image to your Facebook post.",
              });
              window.open(url, '_blank', 'width=600,height=400');
              break;
            case 'instagram':
              navigator.clipboard.writeText(shareText);
              toast({
                title: "Image saved & text copied! 📸",
                description: "Open Instagram and post the downloaded image with the copied caption.",
              });
              break;
            case 'copy':
              navigator.clipboard.writeText(shareText);
              toast({
                title: "Text copied!",
                description: "Share text copied successfully.",
              });
              break;
          }
        }, 500); // Small delay to ensure download starts first
        
      } catch (error) {
        console.error('Failed to save image:', error);
        toast({
          title: "Error",
          description: "Failed to save image. Please try again.",
        });
      }
    }
  };

  const handleSaveImage = async () => {
    if (!shareCardRef.current) return;
    
    try {
      // Create a wrapper with padding to preserve rounded corners
      const wrapper = document.createElement('div');
      wrapper.style.padding = '20px';
      wrapper.style.backgroundColor = 'transparent';
      
      const dataUrl = await htmlToImage.toPng(shareCardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: 'transparent',
        style: {
          borderRadius: '0.75rem', // Force rounded corners
          overflow: 'hidden'
        }
      });
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.download = `prodscale-${today}-score-${score.toFixed(1)}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Image saved!",
        description: "Your productivity card has been downloaded.",
      });
    } catch (error) {
      console.error('Failed to save image:', error);
      toast({
        title: "Failed to save image",
        description: "Please try again.",
      });
    }
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

      {/* Background Selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Card Background</h3>
        <Button
          onClick={() => setShowBgPicker(!showBgPicker)}
          size="sm"
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Palette className="w-4 h-4" />
          <span>Change Background</span>
        </Button>
      </div>

      {/* Share Card Preview */}
      <div className="relative">
        <motion.div
          ref={shareCardRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${selectedBg.class} rounded-xl p-6 text-white space-y-4 relative overflow-hidden`}
          style={{
            ...selectedBg.style,
            borderRadius: '0.75rem' // Ensure rounded corners are explicitly set
          }}
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
      </div>

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
            <span>Copy Text</span>
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

      {/* Background Picker Modal */}
      {showBgPicker && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowBgPicker(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Choose Background</h3>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    setSelectedBg(bg);
                    setShowBgPicker(false);
                  }}
                  className={`${bg.class} h-20 rounded-lg border-2 transition-all ${
                    selectedBg.id === bg.id 
                      ? 'border-blue-500 shadow-lg scale-105' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={bg.style}
                />
              ))}
            </div>
            <Button 
              onClick={() => setShowBgPicker(false)}
              variant="outline"
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
