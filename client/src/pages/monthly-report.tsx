import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CalendarHeatmap from "@/components/calendar-heatmap";
import Stickman from "@/components/stickman";
import type { DailyEntry } from "@shared/schema";

export default function MonthlyReport() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between pt-8">
          <div className="w-9 h-9 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="w-9"></div>
        </div>
      </div>
    );
  }

  const { entries = [], average = 0, isUnproductive = false } = monthlyData || {};

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
        <h1 className="text-xl font-bold">Monthly Report</h1>
        <div className="w-9"></div>
      </div>

      {/* Month Header */}
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">{monthName}</h2>
        <div className="text-3xl font-bold mb-1">{average}</div>
        <p className="text-sm text-accent">Monthly Average</p>
        {isUnproductive && (
          <p className="text-sm text-destructive mt-2">Unproductive Month 😞</p>
        )}
      </div>

      {/* Calendar Heatmap */}
      <div className="space-y-4">
        <h3 className="font-semibold">Daily Scores</h3>
        <CalendarHeatmap 
          entries={entries} 
          year={year} 
          month={month} 
          onDayClick={(date) => setSelectedDate(date)}
        />
      </div>

      {/* Monthly Stickman Badge */}
      <div className="text-center bg-muted rounded-lg p-6">
        <Stickman score={average} size="large" />
        <h3 className="font-semibold mb-1 mt-4">{monthName.split(' ')[0]} Badge</h3>
        <p className="text-sm text-accent">
          {average >= 8 ? "Outstanding performance!" : 
           average >= 6 ? "Good progress made" : 
           "Room for improvement"}
        </p>
      </div>

      {/* Daily Details Modal */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : "Day Details"}
            </DialogTitle>
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
    </motion.div>
  );
}
