import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertDailyEntrySchema, insertActivityCompletionSchema } from "@shared/schema";
import { calculateProductivityScore } from "../client/src/lib/scoring";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve attached assets
  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
  // Get today's daily entry
  app.get("/api/daily-entry/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const userId = "demo-user"; // For demo purposes - replace with actual auth
      
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
      const userId = "demo-user"; // Replace with actual auth
      let activities = await storage.getUserActivities(userId);
      
      // If user has no activities, create default ones
      if (activities.length === 0) {
        const defaultActivities = [
          { userId, name: "Gym Workout", icon: "dumbbell", isDefault: true },
          { userId, name: "Reading", icon: "book-open", isDefault: true },
          { userId, name: "Meditation", icon: "brain", isDefault: true },
          { userId, name: "Learning", icon: "code", isDefault: true },
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
      const completionData = insertActivityCompletionSchema.parse(req.body);
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
      const updateData = insertActivityCompletionSchema.partial().parse(req.body);
      
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
      const userId = "demo-user"; // Replace with actual auth
      
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;
      
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
      const userId = "demo-user"; // Replace with actual auth
      const streak = await storage.getUserStreak(userId);
      res.json(streak || { currentStreak: 0, longestStreak: 0 });
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
