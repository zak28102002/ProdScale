// shared/schema.ts
import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * NOTE: gen_random_uuid() requires the pgcrypto extension:
 *   CREATE EXTENSION IF NOT EXISTS pgcrypto;
 */

/* ================================
   USERS (email + passwordHash)
   ================================ */
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  // New auth fields
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  // // Optional legacy (keep for migration compatibility)
  // username: text("username").unique(),
  // password: text("password"),

  // IAP / subscriptions (future)
  isPro: boolean("is_pro").default(false).notNull(),
  proPlan: text("pro_plan"), // "monthly" | "annual" | "lifetime"
  proSince: timestamp("pro_since"),
  proUntil: timestamp("pro_until"),
  iapProvider: text("iap_provider"), // "apple" | "google" | "stripe"
  paymentId: text("payment_id"),
  iapOriginalTransactionId: text("iap_original_txn_id"),
  iapLatestReceipt: text("iap_latest_receipt"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  status: text("status"), // "active" | "canceled" | "past_due" | etc.

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ================================
   REFRESH TOKENS (store SHA-256 hash)
   ================================ */
export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  familyId: text("family_id").notNull(),
  deviceId: text("device_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // <-- Date in code
  revokedAt: timestamp("revoked_at"),
  replacedBy: varchar("replaced_by"),
});

/* ================================
   PASSWORD RESET TOKENS (hashed)
   ================================ */
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(), // <-- Date in code
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ================================
   EXISTING TABLES (unchanged)
   ================================ */
export const activities = pgTable(
  "activities",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    // ✅ Prevent duplicate activity names for a given user
    uniqUserName: uniqueIndex("uniq_activity_user_name").on(t.userId, t.name),
  }),
);

export const dailyEntries = pgTable("daily_entries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  reflection: text("reflection"),
  score: integer("score").default(0),
  isFinalized: boolean("is_finalized").default(false),
  finalizedAt: timestamp("finalized_at"),
  autoFinalized: boolean("auto_finalized").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activityCompletions = pgTable("activity_completions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  dailyEntryId: varchar("daily_entry_id").notNull(),
  activityId: varchar("activity_id").notNull(),
  duration: integer("duration"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
});

export const streaks = pgTable("streaks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: date("last_activity_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  author: text("author"),
  category: varchar("category", { length: 50 }).default("motivation"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================================
   Zod Insert Schemas
   ================================ */
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  // legacy fields optional during insert
  // username: true,
  // password: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertDailyEntrySchema = createInsertSchema(dailyEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityCompletionSchema = createInsertSchema(
  activityCompletions,
).omit({ id: true });

export const insertStreakSchema = createInsertSchema(streaks).omit({
  id: true,
  updatedAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

/* ================================
   Types
   ================================ */
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type DailyEntry = typeof dailyEntries.$inferSelect;
export type InsertDailyEntry = z.infer<typeof insertDailyEntrySchema>;

export type ActivityCompletion = typeof activityCompletions.$inferSelect;
export type InsertActivityCompletion = z.infer<
  typeof insertActivityCompletionSchema
>;

export type Streak = typeof streaks.$inferSelect;
export type InsertStreak = z.infer<typeof insertStreakSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

/* NEW types */
export type RefreshTokenRow = typeof refreshTokens.$inferSelect;
export type PasswordResetRow = typeof passwordResetTokens.$inferSelect;
