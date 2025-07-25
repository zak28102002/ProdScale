import { motion } from "framer-motion";

interface StickmanProps {
  score: number;
  size?: "normal" | "large";
  inverted?: boolean;
}

export default function Stickman({ score, size = "normal", inverted = false }: StickmanProps) {
  const sizeClass = size === "large" ? "w-[400px] h-[400px]" : "w-20 h-24";

  const getMessage = () => {
    if (score >= 9) return "Excellent work! You're crushing it!";
    if (score >= 7) return "Keep it up! You're doing great today.";
    if (score >= 4) return "You can do better. Push yourself!";
    return "Time to get moving. Start small!";
  };

  const getMascotImage = () => {
    // Map score ranges to mascot images (1-10 scale)
    const scoreLevel = Math.max(1, Math.min(10, Math.ceil(score)));
    
    // Use direct image paths from attached_assets
    const mascotImages = {
      1: "/attached_assets/1_1753466924889.png",
      2: "/attached_assets/2_1753466924889.png",
      3: "/attached_assets/3_1753466924889.png",
      4: "/attached_assets/4_1753466924890.png",
      5: "/attached_assets/5_1753466924890.png",
      6: "/attached_assets/6_1753466924890.png",
      7: "/attached_assets/7_1753466924890.png",
      8: "/attached_assets/8_1753466924891.png",
      9: "/attached_assets/9_1753466924891.png",
      10: "/attached_assets/10_1753466924891.png",
    };
    
    return mascotImages[scoreLevel as keyof typeof mascotImages];
  };

  const mascotSrc = getMascotImage();

  return (
    <div className="text-center -my-8">
      <motion.div
        className={`mx-auto ${sizeClass} filter invert brightness-0 contrast-100 overflow-hidden`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <motion.img
          src={mascotSrc}
          alt={`Mascot for score ${score.toFixed(1)}`}
          className="w-full h-full object-cover object-center mt-[-119px] mb-[-119px] ml-[-30px] mr-[-30px] pl-[0px] pr-[0px] pt-[0px] pb-[0px]"
          style={{ 
            clipPath: 'inset(10% 10% 10% 10%)',
            transform: 'scale(1.2)'
          }}
          initial={{ scale: 0.9 }}
          animate={{ 
            scale: score >= 9 ? [1.08, 1.32, 1.2] : 1.2,
            rotate: score >= 9 ? [0, 5, -5, 0] : 0
          }}
          transition={{ 
            duration: score >= 9 ? 1 : 0.5, 
            repeat: score >= 9 ? Infinity : 0, 
            repeatDelay: score >= 9 ? 2 : 0 
          }}
        />
      </motion.div>
      <p className="text-xs text-accent -mt-4">{getMessage()}</p>
    </div>
  );
}
