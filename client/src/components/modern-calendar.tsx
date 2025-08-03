import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DailyEntry } from "@shared/schema";

interface ModernCalendarProps {
  entries: DailyEntry[];
  year: number;
  month: number;
  onMonthChange: (newMonth: number, newYear: number) => void;
  onDayClick?: (date: string) => void;
  onDayHover?: (date: string) => void;
}

export default function ModernCalendar({ 
  entries, 
  year, 
  month, 
  onMonthChange,
  onDayClick,
  onDayHover 
}: ModernCalendarProps) {
  // Create score map
  const scoreMap = new Map();
  entries.forEach(entry => {
    scoreMap.set(entry.date, entry.score || 0);
  });

  // Get first day and days in month
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  // Week headers
  const weekHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Adjust for Monday start
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  
  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = adjustedStartDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      score: 0,
      dateStr: ''
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const score = scoreMap.get(dateStr) || 0;
    calendarDays.push({ 
      day, 
      isCurrentMonth: true, 
      score, 
      dateStr 
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      score: 0,
      dateStr: ''
    });
  }

  const getDotColor = (score: number) => {
    if (score >= 8) return "bg-pink-500";
    if (score >= 6) return "bg-orange-500";
    if (score >= 4) return "bg-yellow-500";
    if (score >= 2) return "bg-red-500";
    if (score > 0) return "bg-red-800";
    return "";
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'short' });
  
  // Calculate current streak
  const today = new Date().toISOString().split('T')[0];
  let currentStreak = 0;
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  
  for (const entry of sortedEntries) {
    if (entry.score && entry.score > 0) {
      const entryDate = new Date(entry.date);
      const todayDate = new Date(today);
      const dayDiff = Math.floor((todayDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }
  }



  return (
    <div className="space-y-6 bg-black text-white p-4 rounded-lg">
      {/* Streak Display */}
      <div className="flex items-center justify-center py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-sm">🔥</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold">{currentStreak}</span>
            <span className="text-sm text-gray-400 ml-2">day streak</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-4">
        {/* Week headers */}
        <div className="grid grid-cols-7 gap-2 text-xs text-gray-500">
          {weekHeaders.map((header) => (
            <div key={header} className="text-center">
              {header}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayData, index) => (
            <button
              key={index}
              onClick={() => {
                if (dayData.isCurrentMonth && dayData.score > 0 && onDayClick) {
                  onDayClick(dayData.dateStr);
                }
              }}
              onMouseEnter={() => {
                if (dayData.isCurrentMonth && dayData.score > 0 && onDayHover) {
                  onDayHover(dayData.dateStr);
                }
              }}
              disabled={!dayData.isCurrentMonth}
              className={`
                relative h-10 rounded-lg flex flex-col items-center justify-center
                ${!dayData.isCurrentMonth ? 'text-gray-600' : 'text-white'}
                ${dayData.isCurrentMonth && dayData.score > 0 ? 'cursor-pointer hover:bg-gray-800' : ''}
                ${isToday(dayData.dateStr) ? 'ring-2 ring-white' : ''}
                transition-colors
              `}
            >
              <span className="text-sm">{dayData.day}</span>
              {dayData.isCurrentMonth && dayData.score > 0 && (
                <div className={`w-2 h-2 rounded-full mt-0.5 ${getDotColor(dayData.score)}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
            <span className="text-xs">📅</span>
          </div>
          <span className="text-sm">{monthName} {year}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevMonth}
            className="text-white hover:bg-gray-800 h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextMonth}
            className="text-white hover:bg-gray-800 h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}