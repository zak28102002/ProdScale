import { motion } from "framer-motion";
import type { DailyEntry } from "@shared/schema";

interface CalendarHeatmapProps {
  entries: DailyEntry[];
  year: number;
  month: number;
}

export default function CalendarHeatmap({ entries, year, month }: CalendarHeatmapProps) {
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
    if (score >= 8) return "bg-black";
    if (score >= 6) return "bg-gray-400";
    if (score >= 3) return "bg-gray-300";
    return "bg-gray-200";
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {/* Week headers */}
        {weekHeaders.map((header, index) => (
          <div key={index} className="text-xs text-center text-accent p-1">
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
                    isToday(dayData.dateStr) ? 'border-2 border-black' : ''
                  }`
                : 'bg-transparent'
            }`}
            title={dayData ? `Day ${dayData.day}: Score ${dayData.score}/10` : ''}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 text-xs text-accent mt-4">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-black rounded-sm"></div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
