import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarHeatmap from "@/components/calendar-heatmap";
import Stickman from "@/components/stickman";
import type { DailyEntry } from "@shared/schema";

export default function MonthlyReport() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: monthlyData, isLoading } = useQuery<{
    entries: DailyEntry[];
    average: number;
    isUnproductive: boolean;
  }>({
    queryKey: ["/api/monthly", year, month],
    enabled: true,
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
        <CalendarHeatmap entries={entries} year={year} month={month} />
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
    </motion.div>
  );
}
