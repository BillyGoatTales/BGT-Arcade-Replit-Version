import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  characterSprite: text("character_sprite"), // Base64 encoded 8-bit character sprite
  characterData: jsonb("character_data"), // Character customization data
  totalScore: integer("total_score").default(0).notNull(),
  gamesPlayed: integer("games_played").default(0).notNull(),
  isPremium: boolean("is_premium").default(false),
  trialEndDate: varchar("trial_end_date"),
  affiliateId: varchar("affiliate_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scores table
export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: integer("game_id").notNull().references(() => games.id),
  score: integer("score").notNull(),
  level: integer("level").default(1),
  playedAt: timestamp("played_at").defaultNow(),
});

// Feedback table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  gameId: integer("game_id").references(() => games.id), // Optional - for game-specific feedback
  status: varchar("status").default("open").notNull(),
  priority: varchar("priority").default("medium").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  scores: many(scores),
  feedback: many(feedback),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  scores: many(scores),
  feedback: many(feedback),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, { fields: [feedback.userId], references: [users.id] }),
  game: one(games, { fields: [feedback.gameId], references: [games.id] }),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  user: one(users, {
    fields: [scores.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [scores.gameId],
    references: [games.id],
  }),
}));

// Schema validation - define exactly what we need
export const insertUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

// Schema validation for score submission
export const insertScoreSchema = z.object({
  gameId: z.number(),
  score: z.number(),
  level: z.number().optional(),
});

export const insertFeedbackSchema = z.object({
  type: z.enum(["bug_report", "game_request", "suggestion", "general"]),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  gameId: z.number().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Score = typeof scores.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
