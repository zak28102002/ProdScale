import { motion } from "framer-motion";

interface StickmanProps {
  score: number;
  size?: "normal" | "large";
  inverted?: boolean;
}

export default function Stickman({ score, size = "normal", inverted = false }: StickmanProps) {
  const sizeClass = size === "large" ? "w-24 h-28" : "w-20 h-24";
  const strokeColor = inverted ? "white" : "black";
  const fillColor = inverted ? "white" : "black";

  const getMessage = () => {
    if (score >= 9) return "Excellent work! You're crushing it! 💪";
    if (score >= 7) return "Keep it up! You're doing great today.";
    if (score >= 4) return "You can do better. Push yourself!";
    return "Time to get moving. Start small!";
  };

  const getStickmanVariant = () => {
    if (score >= 9) return "flexing";
    if (score >= 7) return "happy";
    if (score >= 4) return "tired";
    return "sleeping";
  };

  const variant = getStickmanVariant();

  return (
    <div className="text-center">
      <motion.div
        className={`stickman mx-auto mb-2 ${sizeClass}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <svg viewBox="0 0 80 100" className="w-full h-full">
          {variant === "flexing" && (
            <motion.g
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              {/* Head */}
              <circle cx="40" cy="15" r="10" fill="none" stroke={strokeColor} strokeWidth="2"/>
              {/* Happy face */}
              <circle cx="36" cy="12" r="1" fill={fillColor}/>
              <circle cx="44" cy="12" r="1" fill={fillColor}/>
              <path d="M 32 18 Q 40 22 48 18" fill="none" stroke={strokeColor} strokeWidth="1.5"/>
              {/* Body */}
              <line x1="40" y1="25" x2="40" y2="60" stroke={strokeColor} strokeWidth="2"/>
              {/* Flexing arms */}
              <line x1="40" y1="35" x2="25" y2="30" stroke={strokeColor} strokeWidth="2"/>
              <line x1="40" y1="35" x2="55" y2="30" stroke={strokeColor} strokeWidth="2"/>
              <line x1="25" y1="30" x2="20" y2="25" stroke={strokeColor} strokeWidth="2"/>
              <line x1="55" y1="30" x2="60" y2="25" stroke={strokeColor} strokeWidth="2"/>
              {/* Legs */}
              <line x1="40" y1="60" x2="30" y2="85" stroke={strokeColor} strokeWidth="2"/>
              <line x1="40" y1="60" x2="50" y2="85" stroke={strokeColor} strokeWidth="2"/>
              {/* Feet */}
              <line x1="30" y1="85" x2="25" y2="85" stroke={strokeColor} strokeWidth="2"/>
              <line x1="50" y1="85" x2="55" y2="85" stroke={strokeColor} strokeWidth="2"/>
            </motion.g>
          )}

          {variant === "happy" && (
            <g>
              {/* Head */}
              <circle cx="40" cy="15" r="10" fill="none" stroke={strokeColor} strokeWidth="2"/>
              {/* Happy face */}
              <circle cx="36" cy="12" r="1" fill={fillColor}/>
              <circle cx="44" cy="12" r="1" fill={fillColor}/>
              <path d="M 32 18 Q 40 22 48 18" fill="none" stroke={strokeColor} strokeWidth="1.5"/>
              {/* Body */}
              <line x1="40" y1="25" x2="40" y2="60" stroke={strokeColor} strokeWidth="2"/>
              {/* Arms */}
              <line x1="40" y1="35" x2="28" y2="45" stroke={strokeColor} strokeWidth="2"/>
              <line x1="40" y1="35" x2="52" y2="45" stroke={strokeColor} strokeWidth="2"/>
              {/* Legs */}
              <line x1="40" y1="60" x2="30" y2="85" stroke={strokeColor} strokeWidth="2"/>
              <line x1="40" y1="60" x2="50" y2="85" stroke={strokeColor} strokeWidth="2"/>
              {/* Feet */}
              <line x1="30" y1="85" x2="25" y2="85" stroke={strokeColor} strokeWidth="2"/>
              <line x1="50" y1="85" x2="55" y2="85" stroke={strokeColor} strokeWidth="2"/>
            </g>
          )}

          {variant === "tired" && (
            <g>
              {/* Head */}
              <circle cx="40" cy="15" r="10" fill="none" stroke={strokeColor} strokeWidth="2"/>
              {/* Tired face */}
              <circle cx="36" cy="12" r="1" fill={fillColor}/>
              <circle cx="44" cy="12" r="1" fill={fillColor}/>
              <path d="M 34 18 Q 40 16 46 18" fill="none" stroke={strokeColor} strokeWidth="1.5"/>
              {/* Body */}
              <line x1="40" y1="25" x2="40" y2="60" stroke={strokeColor} strokeWidth="2"/>
              {/* Drooping arms */}
              <line x1="40" y1="35" x2="25" y2="50" stroke={strokeColor} strokeWidth="2"/>
              <line x1="40" y1="35" x2="55" y2="50" stroke={strokeColor} strokeWidth="2"/>
              {/* Legs */}
              <line x1="40" y1="60" x2="30" y2="85" stroke={strokeColor} strokeWidth="2"/>
              <line x1="40" y1="60" x2="50" y2="85" stroke={strokeColor} strokeWidth="2"/>
            </g>
          )}

          {variant === "sleeping" && (
            <g>
              {/* Head */}
              <circle cx="40" cy="15" r="10" fill="none" stroke={strokeColor} strokeWidth="2"/>
              {/* Sleeping face */}
              <path d="M 34 12 L 38 12" stroke={strokeColor} strokeWidth="1"/>
              <path d="M 42 12 L 46 12" stroke={strokeColor} strokeWidth="1"/>
              <ellipse cx="40" cy="18" rx="3" ry="1" fill="none" stroke={strokeColor} strokeWidth="1"/>
              {/* Body lying down */}
              <line x1="40" y1="25" x2="40" y2="40" stroke={strokeColor} strokeWidth="2"/>
              <line x1="40" y1="40" x2="65" y2="45" stroke={strokeColor} strokeWidth="2"/>
              {/* Arms */}
              <line x1="45" y1="30" x2="35" y2="35" stroke={strokeColor} strokeWidth="2"/>
              <line x1="45" y1="35" x2="55" y2="40" stroke={strokeColor} strokeWidth="2"/>
              {/* Legs */}
              <line x1="55" y1="45" x2="50" y2="60" stroke={strokeColor} strokeWidth="2"/>
              <line x1="60" y1="45" x2="65" y2="60" stroke={strokeColor} strokeWidth="2"/>
            </g>
          )}
        </svg>
      </motion.div>
      {!inverted && (
        <p className="text-xs text-accent">{getMessage()}</p>
      )}
    </div>
  );
}
