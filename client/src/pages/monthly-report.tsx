import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, X, Calendar, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CalendarHeatmap from "@/components/calendar-heatmap";
import ModernCalendar from "@/components/modern-calendar";
import Stickman from "@/components/stickman";
import type { DailyEntry } from "@shared/schema";

export default function MonthlyReport() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  
  // Mock Pro subscription status - in production this would come from user data
  const isPro = false;

  const { data: monthlyData, isLoading } = useQuery<{
    entries: DailyEntry[];
    average: number;
    isUnproductive: boolean;
  }>({
    queryKey: ["/api/monthly", year, month],
    enabled: true,
  });

  // Fetch selected day details
  const { data: dayDetails } = useQuery<{
    id: string;
    date: string;
    reflection: string | null;
    score: number;
    isFinalized: boolean;
    completions: Array<{
      id: string;
      completed: boolean;
      duration: number | null;
      activityName: string;
      activityIcon: string;
    }>;
    completedCount: number;
    totalActivities: number;
  }>({
    queryKey: ["/api/daily-entry-details", selectedDate],
    enabled: !!selectedDate,
  });

  const monthName = new Date(year, month - 1).toLocaleString('it-IT', { month: 'long', year: 'numeric' });

  // Removed navigation functions since arrows are removed

  const isCurrentMonth = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return year === currentYear && month === currentMonth;
  };



  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  const handleMonthYearSelect = (newMonth: number, newYear: number) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Don't allow future months
    if (newYear > currentYear || (newYear === currentYear && newMonth > currentMonth)) {
      return;
    }
    
    setMonth(newMonth);
    setYear(newYear);
    setIsMonthPickerOpen(false);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 space-y-6"
      >
        {/* Header skeleton */}
        <div className="flex items-center justify-between pt-8">
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mx-auto animate-pulse"></div>
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        
        {/* Calendar skeleton */}
        <div className="mt-8">
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const { entries = [], average = 0, isUnproductive = false } = monthlyData || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-6 pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-8">
        <Link href="/reports">
          <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        
        {/* Centered Month Display with Historical Tracking */}
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Historical Day Tracking</p>
          <h1 className="text-xl font-bold text-black dark:text-white">{monthName}</h1>
        </div>
        
        {/* Month Picker */}
        <Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Calendar className="w-4 h-4 text-black dark:text-white" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="end">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Select Month & Year</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Year</label>
                  <Select value={year.toString()} onValueChange={(value) => {
                    const newYear = parseInt(value);
                    handleMonthYearSelect(month, newYear);
                  }}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Month</label>
                  <Select value={month.toString()} onValueChange={(value) => {
                    const newMonth = parseInt(value);
                    handleMonthYearSelect(newMonth, year);
                  }}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(m => {
                        const currentMonth = new Date().getMonth() + 1;
                        const currentYear = new Date().getFullYear();
                        const isDisabled = year > currentYear || (year === currentYear && m.value > currentMonth);
                        return (
                          <SelectItem 
                            key={m.value} 
                            value={m.value.toString()}
                            disabled={isDisabled}
                          >
                            {m.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Month Header */}
      <div className="text-center bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">Monthly Report</h2>
        <div className="text-3xl font-bold mb-1 text-black dark:text-white">{average}</div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Average</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Tap any day to view details</p>
        {isUnproductive && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">Unproductive Month</p>
        )}
      </div>

      {/* Modern Calendar */}
      <ModernCalendar 
        entries={entries} 
        year={year} 
        month={month}
        onMonthChange={(newMonth, newYear) => {
          setMonth(newMonth);
          setYear(newYear);
        }}
        onDayClick={(date) => {
          // Check if it's today's date
          const today = new Date().toISOString().split('T')[0];
          if (date === today) {
            setSelectedDate(date);
          } else if (!isPro) {
            setShowProModal(true);
          } else {
            setSelectedDate(date);
          }
        }}
        onDayHover={(date) => {
          // Prefetch the data when hovering
          queryClient.prefetchQuery({
            queryKey: ["/api/daily-entry-details", date],
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
          });
        }}
      />

      {/* Monthly Stickman Badge */}
      <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <Stickman score={average} size="large" />
        <h3 className="font-semibold mb-1 mt-4 text-black dark:text-white">{monthName.split(' ')[0]} Badge</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {average >= 8 ? "Outstanding performance!" : 
           average >= 6 ? "Good progress made" : 
           "Room for improvement"}
        </p>
      </div>

      {/* Daily Details Modal */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-sm rounded-2xl border-gray-200 dark:border-gray-800 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : "Day Details"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              View daily activity details and reflection
            </DialogDescription>
          </DialogHeader>
          
          {dayDetails && (
            <div className="space-y-4">
              {/* Score Display */}
              <div className="text-center">
                <div className="text-3xl font-bold text-black dark:text-white">
                  {dayDetails.score.toFixed(1)}/10
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {dayDetails.isFinalized ? "Final Score" : "Current Score"}
                </div>
              </div>

              {/* Activities Completed */}
              <div className="space-y-2">
                <h3 className="font-semibold">Activities ({dayDetails.completedCount}/{dayDetails.totalActivities})</h3>
                <div className="space-y-2">
                  {dayDetails.completions.map((completion) => (
                    <div key={completion.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{completion.activityName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {completion.duration && (
                          <span className="text-xs text-gray-500">{completion.duration}min</span>
                        )}
                        <span className={`text-sm ${completion.completed ? 'text-green-600' : 'text-gray-400'}`}>
                          {completion.completed ? '✓' : '○'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Reflection */}
              {dayDetails.reflection && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Daily Reflection</h3>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    {dayDetails.reflection}
                  </div>
                </div>
              )}

              {!dayDetails.reflection && dayDetails.isFinalized && (
                <div className="text-center text-gray-500 text-sm">
                  No reflection was added for this day
                </div>
              )}
            </div>
          )}

          {!dayDetails && selectedDate && (
            <div className="text-center text-gray-500">
              No data available for this day
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pro Upgrade Modal */}
      <Dialog open={showProModal} onOpenChange={setShowProModal}>
        <DialogContent className="max-w-sm rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-yellow-500" />
              <span>Upgrade to Pro</span>
            </DialogTitle>
            <DialogDescription className="pt-3 space-y-4">
              <p>View your complete productivity history with ProdScale Pro!</p>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm">Historical Day Tracking includes:</h4>
                <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>View any past day's activities and scores</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Read your daily reflections from any date</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Track your productivity patterns over time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Analyze your progress month by month</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col space-y-2 pt-2">
                <Button 
                  onClick={() => {
                    setShowProModal(false);
                    setLocation('/pro');
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Upgrade to Pro
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => setShowProModal(false)}
                  className="w-full"
                >
                  Maybe Later
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
