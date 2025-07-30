import { motion } from "framer-motion";

interface StickmanProps {
  score: number;
  size?: "normal" | "large";
  inverted?: boolean;
}

export default function Stickman({ score, size = "normal", inverted = false }: StickmanProps) {
  const sizeClass = size === "large" ? "w-[400px] h-[400px]" : "w-20 h-24";

  const getMessage = () => {
    if (score >= 10) return "Victory achieved! You're a productivity champion!";
    if (score >= 8) return "Outstanding work! You're on fire today!";
    if (score >= 7) return "Great progress! Keep up the momentum!";
    if (score >= 6) return "Solid effort! You're doing well!";
    if (score >= 5) return "Steady progress. You're on the right track!";
    if (score >= 3) return "Don't give up! Every step counts!";
    return "Rest and recharge. Tomorrow is a new battle!";
  };

  const getMascotImage = () => {
    // Map score ranges to new knight mascot images
    const clampedScore = Math.max(0, Math.min(10, Math.round(score)));
    
    // Knight mascot images based on your specifications
    if (clampedScore <= 2) {
      return "/attached_assets/mood 0, 1 and 2_1753707066528.png"; // Defeated knight lying down
    } else if (clampedScore <= 4) {
      return "/attached_assets/mood 3 and 4_1753707066528.png"; // Sad knight sitting
    } else if (clampedScore === 5) {
      return "/attached_assets/mood 5_1753707066529.png"; // Neutral knight standing
    } else if (clampedScore === 6) {
      return "/attached_assets/mood 6_1753707066529.png"; // Knight standing normally
    } else if (clampedScore === 7) {
      return "/attached_assets/mood 7_1753707066529.png"; // Knight with slight smile
    } else if (clampedScore <= 9) {
      return "/attached_assets/mood 8 and 9_1753707066529.png"; // Happy knight with big smile
    } else {
      return "/attached_assets/mood 10_1753707066529.png"; // Victorious knight with arms raised
    }
  };

  const mascotSrc = getMascotImage();

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`${sizeClass} overflow-hidden rounded-lg`}
        initial={{ scale: 0.95, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        style={{ willChange: 'transform, opacity' }}
      >
        <motion.img
          src={mascotSrc}
          alt={`Mascot for score ${score.toFixed(1)}`}
          className="w-full h-full object-contain"
          initial={{ scale: 0.9 }}
          animate={{ 
            scale: score >= 9 ? [1.0, 1.1, 1.0] : 1.0,
            rotate: score >= 9 ? [0, 2, -2, 0] : 0
          }}
          transition={{ 
            duration: score >= 9 ? 2 : 0.5, 
            repeat: score >= 9 ? Infinity : 0, 
            repeatDelay: score >= 9 ? 3 : 0 
          }}
        />
      </motion.div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-4 mb-6">{getMessage()}</p>
    </div>
  );
}
