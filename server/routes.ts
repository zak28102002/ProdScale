import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertDailyEntrySchema, insertActivityCompletionSchema, insertActivitySchema } from "@shared/schema";
import { calculateProductivityScore } from "../client/src/lib/scoring";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve attached assets
  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
  // Get today's daily entry
  app.get("/api/daily-entry/:date", async (req, res) => {
    try {
      const { date } = req.params;
      
      // Get demo user by username
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        // Create demo user if doesn't exist
        const newUser = await storage.createUser({ 
          username: "demo", 
          password: "demo",
          isPro: false 
        });
        user = newUser;
      }
      
      const userId = user.id;
      
      const entry = await storage.getDailyEntry(userId, date);
      if (!entry) {
        // Create new entry for today
        const newEntry = await storage.createDailyEntry({
          userId,
          date,
          reflection: "",
          score: 0,
        });
        res.json(newEntry);
      } else {
        res.json(entry);
      }
    } catch (error) {
      console.error("Error fetching daily entry:", error);
      res.status(500).json({ message: "Failed to fetch daily entry" });
    }
  });

  // Update daily entry
  app.patch("/api/daily-entry/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertDailyEntrySchema.partial().parse(req.body);
      
      const updatedEntry = await storage.updateDailyEntry(id, updateData);
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating daily entry:", error);
      res.status(500).json({ message: "Failed to update daily entry" });
    }
  });

  // Get user activities
  app.get("/api/activities", async (req, res) => {
    try {
      // Get demo user by username
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        // Create demo user if doesn't exist
        user = await storage.createUser({ 
          username: "demo", 
          password: "demo",
          isPro: false 
        });
      }
      
      const userId = user.id;
      let activities = await storage.getUserActivities(userId);
      
      // If user has no activities, create default ones (max 3 for free users)
      if (activities.length === 0) {
        const defaultActivities = [
          { userId, name: "Gym Workout", icon: "dumbbell", isDefault: true },
          { userId, name: "Reading", icon: "book-open", isDefault: true },
          { userId, name: "Learning", icon: "brain", isDefault: true },
        ];
        
        for (const activity of defaultActivities) {
          await storage.createActivity(activity);
        }
        
        activities = await storage.getUserActivities(userId);
      }
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Get activity completions for a daily entry
  app.get("/api/daily-entry/:entryId/completions", async (req, res) => {
    try {
      const { entryId } = req.params;
      const completions = await storage.getActivityCompletions(entryId);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching completions:", error);
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  // Update activity completion
  app.post("/api/activity-completion", async (req, res) => {
    try {
      // Convert completedAt string to Date if it exists
      const requestData = { ...req.body };
      if (requestData.completedAt && typeof requestData.completedAt === 'string') {
        requestData.completedAt = new Date(requestData.completedAt);
      }
      
      const completionData = insertActivityCompletionSchema.parse(requestData);
      const completion = await storage.createActivityCompletion(completionData);
      res.json(completion);
    } catch (error) {
      console.error("Error creating completion:", error);
      res.status(500).json({ message: "Failed to create completion" });
    }
  });

  // Update activity completion
  app.patch("/api/activity-completion/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Convert completedAt string to Date if it exists
      const requestData = { ...req.body };
      if (requestData.completedAt && typeof requestData.completedAt === 'string') {
        requestData.completedAt = new Date(requestData.completedAt);
      }
      
      const updateData = insertActivityCompletionSchema.partial().parse(requestData);
      
      const completion = await storage.updateActivityCompletion(id, updateData);
      res.json(completion);
    } catch (error) {
      console.error("Error updating completion:", error);
      res.status(500).json({ message: "Failed to update completion" });
    }
  });

  // Get monthly data
  app.get("/api/monthly/:year/:month", async (req, res) => {
    try {
      const { year, month } = req.params;
      
      // Get demo user by username
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      
      const userId = user.id;
      
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate(); // Get actual last day of the month
      const endDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      
      const entries = await storage.getUserDailyEntries(userId, startDate, endDate);
      
      // Calculate monthly average
      const totalScore = entries.reduce((sum, entry) => sum + (entry.score || 0), 0);
      const average = entries.length > 0 ? totalScore / entries.length : 0;
      
      res.json({
        entries,
        average: parseFloat(average.toFixed(1)),
        isUnproductive: average < 6
      });
    } catch (error) {
      console.error("Error fetching monthly data:", error);
      res.status(500).json({ message: "Failed to fetch monthly data" });
    }
  });

  // Get user streak
  app.get("/api/streak", async (req, res) => {
    try {
      // Get demo user by username
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      
      const userId = user.id;
      const streak = await storage.getUserStreak(userId);
      res.json(streak || { currentStreak: 0, longestStreak: 0 });
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  // Get user info (for Pro status check)
  app.get("/api/user", async (req, res) => {
    try {
      const username = "demo"; // Use username for demo user
      let user = await storage.getUserByUsername(username);
      
      // Create demo user if doesn't exist
      if (!user) {
        user = await storage.createUser({ 
          username: "demo", 
          password: "demo",
          isPro: false 
        });
      }
      
      res.json({ id: user.id, username: user.username, isPro: user.isPro });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Create activity
  app.post("/api/activities", async (req, res) => {
    try {
      // Get demo user by username
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      
      const userId = user.id;
      
      // Check if user is Pro or has less than 3 activities
      const activities = await storage.getUserActivities(userId);
      
      if (!user.isPro && activities.length >= 3) {
        res.status(403).json({ 
          message: "Free users can only have up to 3 activities. Upgrade to Pro for unlimited activities!" 
        });
        return;
      }
      
      const activityData = insertActivitySchema.parse({ ...req.body, userId });
      const activity = await storage.createActivity(activityData);
      res.json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  // Delete activity
  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteActivity(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Finalize day - save progress and reset for next day
  app.post("/api/finalize-day/:date", async (req, res) => {
    try {
      const { date } = req.params;
      
      // Get demo user by username
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      
      const userId = user.id;
      
      // Get daily entry and completions
      const dailyEntry = await storage.getDailyEntry(userId, date);
      if (!dailyEntry) {
        return res.status(404).json({ message: "Daily entry not found" });
      }

      // Check if already finalized
      if (dailyEntry.isFinalized) {
        return res.status(400).json({ message: "Day already finalized" });
      }

      const completions = await storage.getActivityCompletions(dailyEntry.id);
      const activities = await storage.getUserActivities(userId);
      
      // Calculate final score
      const finalScore = calculateProductivityScore({
        completions,
        activities,
        currentStreak: 0, // Will be updated separately
      });

      // Update daily entry with final score and finalization
      await storage.updateDailyEntry(dailyEntry.id, {
        score: Math.round(finalScore * 10) / 10, // Round to 1 decimal
        isFinalized: true,
        finalizedAt: new Date(),
      });

      // Update streak
      const isProductiveDay = finalScore >= 5; // Consider score >= 5 as productive day
      const existingStreak = await storage.getUserStreak(userId);
      
      if (isProductiveDay) {
        const newCurrentStreak = (existingStreak?.currentStreak || 0) + 1;
        const newLongestStreak = Math.max(newCurrentStreak, existingStreak?.longestStreak || 0);
        await storage.updateStreak(userId, {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastActivityDate: date,
        });
      } else {
        // Reset current streak but keep longest streak
        await storage.updateStreak(userId, {
          currentStreak: 0,
          longestStreak: existingStreak?.longestStreak || 0,
          lastActivityDate: date,
        });
      }

      // Create next day's entry with fresh activity completions
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];
      
      // Check if next day entry already exists
      const existingNextEntry = await storage.getDailyEntry(userId, nextDateStr);
      if (!existingNextEntry) {
        const nextEntry = await storage.createDailyEntry({
          userId,
          date: nextDateStr,
          reflection: "",
          score: 0,
        });

        // Create fresh activity completions for next day
        for (const activity of activities) {
          await storage.createActivityCompletion({
            dailyEntryId: nextEntry.id,
            activityId: activity.id,
            completed: false,
            duration: null,
            completedAt: null,
          });
        }
      }

      res.json({ 
        success: true, 
        finalScore: Math.round(finalScore * 10) / 10,
        message: "Day finalized successfully" 
      });
    } catch (error) {
      console.error("Error finalizing day:", error);
      res.status(500).json({ message: "Failed to finalize day" });
    }
  });

  // Auto-finalize day endpoint
  app.post("/api/auto-finalize/:date", async (req, res) => {
    try {
      const { date } = req.params;
      
      // Get demo user by username
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      
      const userId = user.id;
      
      // Get daily entry and completions
      const dailyEntry = await storage.getDailyEntry(userId, date);
      if (!dailyEntry) {
        return res.status(404).json({ message: "Daily entry not found" });
      }

      // Check if already finalized
      if (dailyEntry.isFinalized) {
        return res.status(400).json({ message: "Day already finalized" });
      }

      const completions = await storage.getActivityCompletions(dailyEntry.id);
      const activities = await storage.getUserActivities(userId);
      
      // Calculate final score
      const finalScore = calculateProductivityScore({
        completions,
        activities,
        currentStreak: 0, // Will be updated separately
      });

      // Update daily entry with final score and auto-finalization
      await storage.updateDailyEntry(dailyEntry.id, {
        score: Math.round(finalScore * 10) / 10,
        isFinalized: true,
        autoFinalized: true,
        finalizedAt: new Date(),
      });

      // Update streak
      const isProductiveDay = finalScore >= 5;
      const existingStreak = await storage.getUserStreak(userId);
      
      if (isProductiveDay) {
        const newCurrentStreak = (existingStreak?.currentStreak || 0) + 1;
        const newLongestStreak = Math.max(newCurrentStreak, existingStreak?.longestStreak || 0);
        await storage.updateStreak(userId, {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastActivityDate: date,
        });
      } else {
        await storage.updateStreak(userId, {
          currentStreak: 0,
          longestStreak: existingStreak?.longestStreak || 0,
          lastActivityDate: date,
        });
      }

      // Create next day's entry
      const nextDayDate = new Date(date);
      nextDayDate.setDate(nextDayDate.getDate() + 1);
      const nextDay = nextDayDate.toISOString().split('T')[0];
      
      const existingNextDay = await storage.getDailyEntry(userId, nextDay);
      if (!existingNextDay) {
        const newEntry = await storage.createDailyEntry({
          userId,
          date: nextDay,
          reflection: "",
          score: 0,
        });

        for (const activity of activities) {
          await storage.createActivityCompletion({
            dailyEntryId: newEntry.id,
            activityId: activity.id,
            completed: false,
            duration: 0,
          });
        }
      }

      res.json({ 
        success: true, 
        finalScore: Math.round(finalScore * 10) / 10,
        message: "Day auto-finalized successfully" 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to auto-finalize day" });
    }
  });

  // Undo finalization endpoint
  app.post("/api/undo-finalize/:date", async (req, res) => {
    try {
      const { date } = req.params;
      
      // Get demo user by username
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      
      const userId = user.id;
      
      const dailyEntry = await storage.getDailyEntry(userId, date);
      if (!dailyEntry) {
        return res.status(404).json({ message: "Daily entry not found" });
      }

      if (!dailyEntry.isFinalized) {
        return res.status(400).json({ message: "Day is not finalized" });
      }

      // Reset finalization
      await storage.updateDailyEntry(dailyEntry.id, {
        isFinalized: false,
        autoFinalized: false,
        finalizedAt: null,
        score: 0,
      });

      // Recalculate streak (this might need more complex logic for accurate streaks)
      const existingStreak = await storage.getUserStreak(userId);
      if (existingStreak && (existingStreak.currentStreak || 0) > 0) {
        await storage.updateStreak(userId, {
          currentStreak: Math.max(0, (existingStreak.currentStreak || 0) - 1),
          longestStreak: existingStreak.longestStreak || 0, // Keep longest streak
          lastActivityDate: date,
        });
      }

      res.json({ 
        success: true,
        message: "Day finalization undone successfully" 
      });
    } catch (error) {
      console.error("Error undoing finalization:", error);
      res.status(500).json({ message: "Failed to undo finalization" });
    }
  });

  // Get specific daily entry with details (for monthly report clicks)
  app.get("/api/daily-entry-details/:date", async (req, res) => {
    try {
      const { date } = req.params;
      
      // Get demo user by username
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      
      const userId = user.id;
      
      const entry = await storage.getDailyEntry(userId, date);
      if (!entry) {
        return res.status(404).json({ message: "Daily entry not found" });
      }

      const completions = await storage.getActivityCompletions(entry.id);
      const activities = await storage.getUserActivities(userId);
      
      // Add activity names to completions
      const completionsWithNames = completions.map(completion => {
        const activity = activities.find(a => a.id === completion.activityId);
        return {
          ...completion,
          activityName: activity?.name || "Unknown Activity",
          activityIcon: activity?.icon || "help-circle"
        };
      });

      res.json({
        ...entry,
        completions: completionsWithNames,
        completedCount: completions.filter(c => c.completed).length,
        totalActivities: activities.length
      });
    } catch (error) {
      console.error("Error fetching daily entry details:", error);
      res.status(500).json({ message: "Failed to fetch daily entry details" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
