import {
  users,
  activities,
  dailyEntries,
  activityCompletions,
  streaks,
  type User,
  type InsertUser,
  type Activity,
  type InsertActivity,
  type DailyEntry,
  type InsertDailyEntry,
  type ActivityCompletion,
  type InsertActivityCompletion,
  type Streak,
  type InsertStreak,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Activity operations
  getUserActivities(userId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  deleteActivity(id: string): Promise<void>;
  getDefaultActivities(): Promise<Activity[]>;

  // Daily entry operations
  getDailyEntry(userId: string, date: string): Promise<DailyEntry | null>;
  createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry>;
  updateDailyEntry(id: string, entry: Partial<DailyEntry>): Promise<DailyEntry>;
  getUserDailyEntries(userId: string, startDate?: string, endDate?: string): Promise<DailyEntry[]>;

  // Activity completion operations
  getActivityCompletions(dailyEntryId: string): Promise<ActivityCompletion[]>;
  createActivityCompletion(completion: InsertActivityCompletion): Promise<ActivityCompletion>;
  updateActivityCompletion(id: string, completion: Partial<ActivityCompletion>): Promise<ActivityCompletion>;

  // Streak operations
  getUserStreak(userId: string): Promise<Streak | null>;
  updateStreak(userId: string, streak: Partial<Streak>): Promise<Streak>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Activity operations
  async getUserActivities(userId: string): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(activities.createdAt);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async deleteActivity(id: string): Promise<void> {
    await db.delete(activities).where(eq(activities.id, id));
  }

  async getDefaultActivities(): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.isDefault, true));
  }

  // Daily entry operations
  async getDailyEntry(userId: string, date: string): Promise<DailyEntry | null> {
    const [entry] = await db
      .select()
      .from(dailyEntries)
      .where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.date, date)));
    return entry || null;
  }

  async createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry> {
    const [newEntry] = await db.insert(dailyEntries).values(entry).returning();
    return newEntry;
  }

  async updateDailyEntry(id: string, entry: Partial<DailyEntry>): Promise<DailyEntry> {
    const [updatedEntry] = await db
      .update(dailyEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(dailyEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async getUserDailyEntries(userId: string, startDate?: string, endDate?: string): Promise<DailyEntry[]> {
    let whereConditions = [eq(dailyEntries.userId, userId)];
    
    if (startDate && endDate) {
      whereConditions.push(
        sql`${dailyEntries.date} >= ${startDate}`,
        sql`${dailyEntries.date} <= ${endDate}`
      );
    }
    
    return await db
      .select()
      .from(dailyEntries)
      .where(and(...whereConditions))
      .orderBy(desc(dailyEntries.date));
  }

  // Activity completion operations
  async getActivityCompletions(dailyEntryId: string): Promise<ActivityCompletion[]> {
    return await db
      .select()
      .from(activityCompletions)
      .where(eq(activityCompletions.dailyEntryId, dailyEntryId));
  }

  async createActivityCompletion(completion: InsertActivityCompletion): Promise<ActivityCompletion> {
    const [newCompletion] = await db.insert(activityCompletions).values(completion).returning();
    return newCompletion;
  }

  async updateActivityCompletion(id: string, completion: Partial<ActivityCompletion>): Promise<ActivityCompletion> {
    const [updatedCompletion] = await db
      .update(activityCompletions)
      .set(completion)
      .where(eq(activityCompletions.id, id))
      .returning();
    return updatedCompletion;
  }

  // Streak operations
  async getUserStreak(userId: string): Promise<Streak | null> {
    const [streak] = await db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, userId));
    return streak || null;
  }

  async updateStreak(userId: string, streak: Partial<Streak>): Promise<Streak> {
    const existingStreak = await this.getUserStreak(userId);
    
    if (existingStreak) {
      const [updatedStreak] = await db
        .update(streaks)
        .set({ ...streak, updatedAt: new Date() })
        .where(eq(streaks.userId, userId))
        .returning();
      return updatedStreak;
    } else {
      const [newStreak] = await db
        .insert(streaks)
        .values({ userId, ...streak })
        .returning();
      return newStreak;
    }
  }
}

export const storage = new DatabaseStorage();
