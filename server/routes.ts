import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertScoreSchema, insertFeedbackSchema } from "@shared/schema";
import type { AuthenticatedRequest } from "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Initialize games data
  const initGames = async () => {
    const existingGames = await storage.getGames();
    if (existingGames.length === 0) {
      // Insert initial games - we'll need to do this manually in the database
      console.log("Games table appears empty. Please run the following SQL:");
      console.log(`
        INSERT INTO games (name, slug, description) VALUES 
        ('Goat Chomper', 'goat-chomper', 'Navigate mazes, collect coins, avoid enemies'),
        ('Space Goats', 'space-goats', 'Defend the galaxy from alien invaders'), 
        ('Goat Crosser', 'goat-crosser', 'Cross busy streets and rivers safely');
      `);
    }
  };
  initGames();

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/auth/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const profileData = req.body;
      console.log("Updating profile for user:", userId, "with data:", profileData);
      
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
  });

  // Character creation routes
  app.post("/api/user/character", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const characterData = req.body;
      console.log("Saving character for user:", userId);
      
      const updatedUser = await storage.updateUserCharacter(userId, characterData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error saving character:", error);
      res.status(500).json({ message: "Failed to save character", error: error.message });
    }
  });

  // Game routes
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:slug", async (req, res) => {
    try {
      const game = await storage.getGameBySlug(req.params.slug);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  // Score routes
  app.post("/api/scores", isAuthenticated, async (req: any, res) => {
    try {
      console.log("Score submission attempt:", req.body);
      console.log("Session:", req.session);
      console.log("User from req.user:", req.user);
      
      const scoreData = insertScoreSchema.parse(req.body);
      
      // Get user ID from session or req.user
      let userId = req.user?.id || req.session?.passport?.user?.id || req.session?.userId;
      
      if (!userId) {
        console.error("No user ID found in session or req.user");
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      
      console.log("Creating score with data:", { userId, ...scoreData });
      const score = await storage.createScore(userId, scoreData);
      
      // Update user total score
      await storage.updateUserTotalScore(userId);
      
      console.log("Score created successfully:", score);
      res.json(score);
    } catch (error) {
      console.error("Error creating score:", error);
      res.status(500).json({ message: "Failed to create score", error: error.message });
    }
  });

  app.get("/api/scores/leaderboard", async (req, res) => {
    try {
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const scores = await storage.getTopScores(gameId, limit);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/scores/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
      
      const scores = await storage.getUserScores(userId, gameId);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching user scores:", error);
      res.status(500).json({ message: "Failed to fetch user scores" });
    }
  });

  app.get("/api/scores/user", isAuthenticated, async (req: any, res) => {
    try {
      // Get user ID from session or req.user
      let userId = req.user?.id || req.session?.passport?.user?.id || req.session?.userId;
      
      if (!userId) {
        console.error("No user ID found for user scores request");
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
      
      const scores = await storage.getUserScores(userId, gameId);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching authenticated user scores:", error);
      res.status(500).json({ message: "Failed to fetch user scores" });
    }
  });

  app.get("/api/scores/user/:userId/best/:gameId", async (req, res) => {
    try {
      const { userId, gameId } = req.params;
      const score = await storage.getUserBestScore(userId, parseInt(gameId));
      res.json(score || { score: 0 });
    } catch (error) {
      console.error("Error fetching user best score:", error);
      res.status(500).json({ message: "Failed to fetch user best score" });
    }
  });

  const httpServer = createServer(app);
  // Feedback endpoints
  app.post("/api/feedback", isAuthenticated, async (req: any, res: any) => {
    try {
      const userId = req.session.userId!;
      const feedbackData = insertFeedbackSchema.parse(req.body);
      
      const newFeedback = await storage.createFeedback(userId, feedbackData);
      res.status(201).json(newFeedback);
    } catch (error) {
      console.error("Feedback creation error:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  app.get("/api/feedback/user", isAuthenticated, async (req: any, res: any) => {
    try {
      const userId = req.session.userId!;
      const userFeedback = await storage.getUserFeedback(userId);
      res.json(userFeedback);
    } catch (error) {
      console.error("User feedback fetch error:", error);
      res.status(500).json({ message: "Failed to fetch user feedback" });
    }
  });

  app.get("/api/feedback/all", isAuthenticated, async (req: any, res: any) => {
    try {
      // Note: In production, this should be admin-only
      const allFeedback = await storage.getAllFeedback();
      res.json(allFeedback);
    } catch (error) {
      console.error("All feedback fetch error:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  return httpServer;
}
