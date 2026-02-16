import {
  users,
  games,
  scores,
  feedback,
  type User,
  type InsertUser,
  type Game,
  type Score,
  type InsertScore,
  type Feedback,
  type InsertFeedback,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game operations
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  getGameBySlug(slug: string): Promise<Game | undefined>;
  
  // Score operations
  createScore(userId: string, score: InsertScore): Promise<Score>;
  getUserScores(userId: string, gameId?: number): Promise<Score[]>;
  getTopScores(gameId?: number, limit?: number): Promise<(Score & { username: string })[]>;
  getUserBestScore(userId: string, gameId: number): Promise<Score | undefined>;
  updateUserTotalScore(userId: string): Promise<void>;
  getOverallLeaderboard(limit?: number): Promise<Array<{
    username: string;
    totalScore: number;
    gamesPlayed: number;
    bestGame: string;
  }>>;
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User>;
  updateUserCharacter(userId: string, characterData: any): Promise<User>;
  verifyUserEmail(token: string): Promise<User | undefined>;
  
  // Feedback operations
  createFeedback(userId: string, feedback: InsertFeedback): Promise<Feedback>;
  getUserFeedback(userId: string): Promise<Feedback[]>;
  getAllFeedback(): Promise<Array<Feedback & { username: string }>>;
  updateFeedbackStatus(feedbackId: number, status: string, adminNotes?: string): Promise<Feedback | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserCharacter(userId: string, characterData: any): Promise<User> {
    const { sprite, ...character } = characterData;
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        characterSprite: sprite,
        characterData: character,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async verifyUserEmail(token: string): Promise<User | undefined> {
    // Simplified email verification - implement full logic as needed
    return undefined;
  }

  // Game operations
  async getGames(): Promise<Game[]> {
    return await db.select().from(games).where(eq(games.isActive, true));
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async getGameBySlug(slug: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.slug, slug));
    return game;
  }

  // Score operations
  async createScore(userId: string, scoreData: InsertScore): Promise<Score> {
    const scoreValues: any = {
      userId,
      gameId: scoreData.gameId,
      score: scoreData.score,
      level: scoreData.level || 1,
    };
    
    const [score] = await db
      .insert(scores)
      .values(scoreValues)
      .returning();
    
    // Update user's games played count and total score using raw SQL
    await db.execute(
      sql`UPDATE users SET games_played = games_played + 1, total_score = total_score + ${scoreValues.score} WHERE id = ${userId}`
    );

    return score;
  }

  async getUserScores(userId: string, gameId?: number): Promise<Score[]> {
    let query = db.select().from(scores).where(eq(scores.userId, userId));
    
    if (gameId) {
      query = db.select().from(scores).where(and(eq(scores.userId, userId), eq(scores.gameId, gameId)));
    }
    
    return await query.orderBy(desc(scores.playedAt));
  }

  async getTopScores(gameId?: number, limit = 10): Promise<(Score & { username: string })[]> {
    const baseQuery = db
      .select({
        id: scores.id,
        userId: scores.userId,
        gameId: scores.gameId,
        score: scores.score,
        level: scores.level,
        playedAt: scores.playedAt,
        username: users.username,
      })
      .from(scores)
      .innerJoin(users, eq(scores.userId, users.id))
      .orderBy(desc(scores.score))
      .limit(limit);

    const results = gameId 
      ? await baseQuery.where(eq(scores.gameId, gameId))
      : await baseQuery;
    
    return results.filter(r => r.username !== null) as (Score & { username: string })[];
  }

  async getUserBestScore(userId: string, gameId: number): Promise<Score | undefined> {
    const [score] = await db
      .select()
      .from(scores)
      .where(and(eq(scores.userId, userId), eq(scores.gameId, gameId)))
      .orderBy(desc(scores.score))
      .limit(1);
    
    return score;
  }

  async updateUserTotalScore(userId: string): Promise<void> {
    const result = await db
      .select({ total: sql<number>`sum(${scores.score})` })
      .from(scores)
      .where(eq(scores.userId, userId));

    const totalScore = result[0]?.total || 0;

    await db.execute(
      sql`UPDATE users SET total_score = ${totalScore} WHERE id = ${userId}`
    );
  }

  async createFeedback(userId: string, feedbackData: InsertFeedback): Promise<Feedback> {
    // Insert using proper database field names
    const result = await db.execute(
      sql`INSERT INTO feedback (user_id, type, title, description, game_id, priority, status, created_at, updated_at) 
          VALUES (${userId}, ${feedbackData.type}, ${feedbackData.title}, ${feedbackData.description}, 
                  ${feedbackData.gameId || null}, ${feedbackData.priority || 'medium'}, 'open', NOW(), NOW()) 
          RETURNING *`
    );
    return result.rows[0] as Feedback;
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    const result = await db.execute(
      sql`SELECT * FROM feedback WHERE user_id = ${userId} ORDER BY created_at DESC`
    );
    return result.rows as Feedback[];
  }

  async getAllFeedback(): Promise<Array<Feedback & { username: string }>> {
    const result = await db.execute(
      sql`SELECT f.*, u.username 
          FROM feedback f 
          JOIN users u ON f.user_id = u.id 
          ORDER BY f.created_at DESC`
    );
    return result.rows as Array<Feedback & { username: string }>;
  }

  async updateFeedbackStatus(feedbackId: number, status: string, adminNotes?: string): Promise<Feedback | undefined> {
    const result = await db.execute(
      sql`UPDATE feedback SET status = ${status}, admin_notes = ${adminNotes}, updated_at = NOW() 
          WHERE id = ${feedbackId} RETURNING *`
    );
    return result.rows[0] as Feedback || undefined;
  }

  async getOverallLeaderboard(limit = 10): Promise<Array<{
    username: string;
    totalScore: number;
    gamesPlayed: number;
    bestGame: string;
  }>> {
    return [];
  }
}

export const storage = new DatabaseStorage();
