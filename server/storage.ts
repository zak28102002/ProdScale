// server/storage.ts
import {
  users,
  activities,
  dailyEntries,
  activityCompletions,
  streaks,
  quotes,
  refreshTokens,
  passwordResetTokens,
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
  type Quote,
  type RefreshTokenRow,
  type PasswordResetRow,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, isNull } from "drizzle-orm";

const DEFAULT_ACTIVITIES = [
  { name: "Gym Workout", icon: "dumbbell" },
  { name: "Learning", icon: "brain" },
  { name: "Reading", icon: "book-open" },
];

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPasswordHash(userId: string, passwordHash: string): Promise<void>;

  // Refresh tokens
  insertRefreshToken(input: {
    userId: string;
    tokenHash: string;
    familyId: string;
    deviceId?: string | null;
    expiresAt: Date; // or number if you switched to integer column
  }): Promise<RefreshTokenRow>;
  findRefreshTokenByHash(
    tokenHash: string,
  ): Promise<RefreshTokenRow | undefined>;
  revokeRefreshToken(id: string, replacedBy?: string): Promise<void>;
  revokeRefreshTokensByFamily(familyId: string): Promise<void>;
  revokeAllRefreshTokensForUser(userId: string): Promise<void>;

  // Password reset
  insertPasswordResetToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetRow>;
  findPasswordResetTokenByHash(
    tokenHash: string,
  ): Promise<PasswordResetRow | undefined>;
  markPasswordResetTokenUsed(id: string): Promise<void>;

  // Activity
  createDefaultActivitiesForUser(userId: string): Promise<Activity[]>;
  getUserActivities(userId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  deleteActivity(id: string): Promise<void>;
  getDefaultActivities(): Promise<Activity[]>;

  // Daily entry
  getDailyEntry(userId: string, date: string): Promise<DailyEntry | null>;
  createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry>;
  updateDailyEntry(id: string, entry: Partial<DailyEntry>): Promise<DailyEntry>;
  getUserDailyEntries(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<DailyEntry[]>;

  // Activity completion
  getActivityCompletions(dailyEntryId: string): Promise<ActivityCompletion[]>;
  createActivityCompletion(
    completion: InsertActivityCompletion,
  ): Promise<ActivityCompletion>;
  updateActivityCompletion(
    id: string,
    completion: Partial<ActivityCompletion>,
  ): Promise<ActivityCompletion>;

  // Streak
  getUserStreak(userId: string): Promise<Streak | null>;
  updateStreak(userId: string, streak: Partial<Streak>): Promise<Streak>;

  // Quote
  getRandomQuote(): Promise<Quote | null>;
}

export class DatabaseStorage implements IStorage {
  // ===== User =====
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createDefaultActivitiesForUser(userId: string) {
    // Multi-row insert; if already present, ignore due to unique index
    await db
      .insert(activities)
      .values(
        DEFAULT_ACTIVITIES.map((a) => ({
          userId,
          name: a.name,
          icon: a.icon,
          isDefault: true,
        })),
      )
      .onConflictDoNothing({
        // target must match the unique index columns
        target: [activities.userId, activities.name],
      });

    // Return all activities for this user (so caller has the latest set)
    return this.getUserActivities(userId);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  }

  // ===== Refresh tokens =====
  async insertRefreshToken(input: {
    userId: string;
    tokenHash: string;
    familyId: string;
    deviceId?: string | null;
    expiresAt: Date;
  }): Promise<RefreshTokenRow> {
    const [row] = await db
      .insert(refreshTokens)
      .values({
        userId: input.userId,
        tokenHash: input.tokenHash,
        familyId: input.familyId,
        deviceId: input.deviceId ?? null,
        expiresAt: input.expiresAt, // timestamp expects Date
      })
      .returning();
    return row;
  }

  async findRefreshTokenByHash(
    tokenHash: string,
  ): Promise<RefreshTokenRow | undefined> {
    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);
    return row || undefined;
  }

  async revokeRefreshToken(id: string, replacedBy?: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date(), replacedBy })
      .where(eq(refreshTokens.id, id));
  }

  async revokeRefreshTokensByFamily(familyId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.familyId, familyId));
  }

  async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  }

  // Delete all existing reset tokens for a user (before issuing a new one)
  async deletePasswordResetTokensForUser(userId: string): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, userId));
  }

  // Count how many reset requests in the last hour (rate limit)
  async countPasswordResetTokensSince(
    userId: string,
    since: Date,
  ): Promise<number> {
    const rows = await db
      .select({ c: sql<number>`count(*)` })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          sql`${passwordResetTokens.createdAt} >= ${since}`,
        ),
      );
    // drizzle returns numeric in driver-specific type; coerce
    return Number((rows?.[0] as any)?.c ?? 0);
  }

  // ===== Password reset =====
  async insertPasswordResetToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetRow> {
    const [row] = await db
      .insert(passwordResetTokens)
      .values({
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      })
      .returning();
    return row;
  }

  async findPasswordResetTokenByHash(
    tokenHash: string,
  ): Promise<PasswordResetRow | undefined> {
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);
    return row || undefined;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, id));
  }

  // ===== Activities =====
  async getUserActivities(userId: string): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(activities.createdAt);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
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

  // ===== Daily entries =====
  async getDailyEntry(
    userId: string,
    date: string,
  ): Promise<DailyEntry | null> {
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

  async updateDailyEntry(
    id: string,
    entry: Partial<DailyEntry>,
  ): Promise<DailyEntry> {
    const [updatedEntry] = await db
      .update(dailyEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(dailyEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async getUserDailyEntries(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<DailyEntry[]> {
    const where = [eq(dailyEntries.userId, userId)];
    if (startDate && endDate) {
      where.push(sql`${dailyEntries.date} >= ${startDate}`);
      where.push(sql`${dailyEntries.date} <= ${endDate}`);
    }
    return await db
      .select()
      .from(dailyEntries)
      .where(and(...where))
      .orderBy(desc(dailyEntries.date));
  }

  // ===== Completions =====
  async getActivityCompletions(
    dailyEntryId: string,
  ): Promise<ActivityCompletion[]> {
    return await db
      .select()
      .from(activityCompletions)
      .where(eq(activityCompletions.dailyEntryId, dailyEntryId));
  }

  async createActivityCompletion(
    completion: InsertActivityCompletion,
  ): Promise<ActivityCompletion> {
    const [newCompletion] = await db
      .insert(activityCompletions)
      .values(completion)
      .returning();
    return newCompletion;
  }

  async updateActivityCompletion(
    id: string,
    completion: Partial<ActivityCompletion>,
  ): Promise<ActivityCompletion> {
    const [updatedCompletion] = await db
      .update(activityCompletions)
      .set(completion)
      .where(eq(activityCompletions.id, id))
      .returning();
    return updatedCompletion;
  }

  // ===== Streaks =====
  async getUserStreak(userId: string): Promise<Streak | null> {
    const [streak] = await db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, userId));
    return streak || null;
  }

  async updateStreak(userId: string, streak: Partial<Streak>): Promise<Streak> {
    const existing = await this.getUserStreak(userId);
    if (existing) {
      const [updated] = await db
        .update(streaks)
        .set({ ...streak, updatedAt: new Date() })
        .where(eq(streaks.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(streaks)
        .values({ userId, ...streak })
        .returning();
      return created;
    }
  }

  // ===== Quotes =====
  async getRandomQuote(): Promise<Quote | null> {
    const all = await db.select().from(quotes);
    if (all.length === 0) return null;
    return all[Math.floor(Math.random() * all.length)];
  }
}

export const storage = new DatabaseStorage();
