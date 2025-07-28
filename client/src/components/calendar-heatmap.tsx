import { motion } from "framer-motion";
import type { DailyEntry } from "@shared/schema";

interface CalendarHeatmapProps {
  entries: DailyEntry[];
  year: number;
  month: number;
  onDayClick?: (date: string) => void;
}

export default function CalendarHeatmap({ entries, year, month, onDayClick }: CalendarHeatmapProps) {
  // Create a map of date to score for quick lookup
  const scoreMap = new Map();
  entries.forEach(entry => {
    scoreMap.set(entry.date, entry.score || 0);
  });

  // Get the first day of the month and number of days
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  // Week headers
  const weekHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const score = scoreMap.get(dateStr) || 0;
    calendarDays.push({ day, score, dateStr });
  }

  const getHeatmapColor = (score: number) => {
    if (score >= 6) return "bg-green-500 dark:bg-green-600"; // Good days (6+) - green
    if (score > 0) return "bg-red-500 dark:bg-red-600"; // Poor days (1-5) - red  
    return "bg-white dark:bg-gray-200 border border-gray-300 dark:border-gray-600"; // Empty days (0) - white/transparent
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-2">
        {/* Week headers */}
        {weekHeaders.map((header, index) => (
          <div key={index} className="text-sm text-center text-gray-600 dark:text-gray-400 p-2 font-medium">
            {header}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((dayData, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`heatmap-day ${
              dayData 
                ? `${getHeatmapColor(dayData.score)} ${
                    isToday(dayData.dateStr) ? 'border-2 border-blue-500 dark:border-blue-400' : ''
                  } ${onDayClick ? 'cursor-pointer hover:opacity-80' : ''} ${dayData.score > 0 ? 'text-white' : 'text-black dark:text-gray-800'}`
                : 'bg-transparent'
            } w-14 h-14 rounded-lg flex items-center justify-center text-sm font-medium transition-all`}
            title={dayData ? `Day ${dayData.day}: Score ${dayData.score}/10` : ''}
            onClick={() => {
              if (dayData && onDayClick && dayData.score > 0) {
                onDayClick(dayData.dateStr);
              }
            }}
          >
            {dayData?.day}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
