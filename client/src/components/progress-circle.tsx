import { motion } from "framer-motion";

interface ProgressCircleProps {
  score: number;
}

export default function ProgressCircle({ score }: ProgressCircleProps) {
  const circumference = 283; // 2 * PI * 45
  const strokeDashoffset = circumference - (score / 10) * circumference;
  
  // Color based on score level
  const getProgressColor = () => {
    if (score < 3) return "text-red-500";
    if (score < 5) return "text-orange-500";
    if (score < 7) return "text-yellow-500";
    if (score < 9) return "text-green-500";
    return "text-blue-500";
  };

  return (
    <div className="relative inline-block">
      <svg className="progress-ring w-32 h-32" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="text-gray-800"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        {/* Progress circle */}
        <motion.circle
          className={getProgressColor()}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
