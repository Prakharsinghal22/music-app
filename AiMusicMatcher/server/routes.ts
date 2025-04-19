import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { recommendationEngine } from "./recommendation-engine";
import { z } from "zod";
import { insertPreferencesSchema, insertUserSchema, insertLikedTrackSchema, insertPlaylistSchema, insertPlaylistTrackSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ========== API Routes ==========
  // All routes are prefixed with /api
  
  // Get current user
  app.get("/api/user/current", async (req, res) => {
    try {
      // For demo, we'll use a static user until auth is implemented
      const user = await storage.getUser(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Add user's playlist info
      const userPlaylists = await storage.getUserPlaylists(user.id);
      const userWithPlaylists = {
        ...user,
        initials: user.name.split(" ").map(part => part[0]).join(""),
        playlists: userPlaylists
      };
      
      res.json(userWithPlaylists);
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get user preferences
  app.get("/api/user/preferences", async (req, res) => {
    try {
      // For demo, we'll use user ID 1 until auth is implemented
      const userId = 1;
      
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error getting user preferences:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update user preferences
  app.patch("/api/user/preferences", async (req, res) => {
    try {
      // For demo, we'll use user ID 1 until auth is implemented
      const userId = 1;
      
      const updatedPreferences = req.body;
      
      // Note: we don't need to validate the preferences using the full schema
      // since this is a PATCH endpoint and only specific fields might be updated
      
      const preferences = await storage.updateUserPreferences(userId, updatedPreferences);
      
      res.json(preferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get recommendations based on user preferences
  app.get("/api/recommendations", async (req, res) => {
    try {
      // For demo, we'll use user ID 1 until auth is implemented
      const userId = 1;
      
      const userPreferences = await storage.getUserPreferences(userId);
      
      if (!userPreferences) {
        return res.status(400).json({ message: "User preferences not found" });
      }
      
      const recommendations = await recommendationEngine.getRecommendations(userPreferences);
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get artist-based recommendations
  app.get("/api/artist-recommendations", async (req, res) => {
    try {
      // This would typically take a specific artist ID, but for demo
      // we'll return recommendations based on Tame Impala (ID 1)
      const artistId = 1;
      
      const recommendedArtists = await recommendationEngine.getArtistRecommendations(artistId);
      
      res.json(recommendedArtists);
    } catch (error) {
      console.error("Error getting artist recommendations:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get artist's top tracks
  app.get("/api/artists/:id/top-tracks", async (req, res) => {
    try {
      const artistId = parseInt(req.params.id, 10);
      
      if (isNaN(artistId)) {
        return res.status(400).json({ message: "Invalid artist ID" });
      }
      
      const artist = await storage.getArtist(artistId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      const topTracks = await storage.getArtistTopTracks(artistId);
      
      res.json(topTracks);
    } catch (error) {
      console.error("Error getting artist top tracks:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Search for tracks and artists
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const type = req.query.type as string || "all";
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      let results: { tracks?: any[], artists?: any[] } = {};
      
      if (type === "all" || type === "tracks") {
        results.tracks = await storage.searchTracks(query);
      }
      
      if (type === "all" || type === "artists") {
        results.artists = await storage.searchArtists(query);
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get user's liked tracks
  app.get("/api/user/liked-tracks", async (req, res) => {
    try {
      // For demo, we'll use user ID 1 until auth is implemented
      const userId = 1;
      
      const likedTracks = await storage.getUserLikedTracks(userId);
      
      res.json(likedTracks);
    } catch (error) {
      console.error("Error getting liked tracks:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Like a track
  app.post("/api/tracks/:id/like", async (req, res) => {
    try {
      // For demo, we'll use user ID 1 until auth is implemented
      const userId = 1;
      const trackId = parseInt(req.params.id, 10);
      
      if (isNaN(trackId)) {
        return res.status(400).json({ message: "Invalid track ID" });
      }
      
      const track = await storage.getTrack(trackId);
      
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      await storage.likeTrack(userId, trackId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking track:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Unlike a track
  app.delete("/api/tracks/:id/like", async (req, res) => {
    try {
      // For demo, we'll use user ID 1 until auth is implemented
      const userId = 1;
      const trackId = parseInt(req.params.id, 10);
      
      if (isNaN(trackId)) {
        return res.status(400).json({ message: "Invalid track ID" });
      }
      
      await storage.unlikeTrack(userId, trackId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking track:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get user's playlists
  app.get("/api/user/playlists", async (req, res) => {
    try {
      // For demo, we'll use user ID 1 until auth is implemented
      const userId = 1;
      
      const playlists = await storage.getUserPlaylists(userId);
      
      res.json(playlists);
    } catch (error) {
      console.error("Error getting user playlists:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create a new playlist
  app.post("/api/playlists", async (req, res) => {
    try {
      // For demo, we'll use user ID 1 until auth is implemented
      const userId = 1;
      
      const playlistData = insertPlaylistSchema.parse({
        ...req.body,
        userId
      });
      
      const playlist = await storage.createPlaylist(playlistData);
      
      res.status(201).json(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid playlist data",
          errors: error.errors
        });
      }
      
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Add track to playlist
  app.post("/api/playlists/:id/tracks", async (req, res) => {
    try {
      const playlistId = parseInt(req.params.id, 10);
      const { trackId } = req.body;
      
      if (isNaN(playlistId) || !trackId) {
        return res.status(400).json({ message: "Invalid playlist ID or track ID" });
      }
      
      const playlist = await storage.getPlaylist(playlistId);
      
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      // For demo, we'll use user ID 1 until auth is implemented
      const userId = 1;
      
      // Check if user owns the playlist
      if (playlist.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to modify this playlist" });
      }
      
      const track = await storage.getTrack(trackId);
      
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      await storage.addTrackToPlaylist(playlistId, trackId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
