import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subscription: text("subscription").default("Free"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// User Preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  energy: integer("energy").default(5),
  acoustics: integer("acoustics").default(5),
  popularity: integer("popularity").default(5),
  mood: integer("mood").default(5),
  instrumental: integer("instrumental").default(5),
  experimental: integer("experimental").default(5),
  genres: json("genres").$type<string[]>().default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  energy: true,
  acoustics: true,
  popularity: true,
  mood: true,
  instrumental: true,
  experimental: true,
  genres: true,
});

// Tracks
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album").notNull(),
  coverUrl: text("cover_url").notNull(),
  duration: integer("duration").notNull(), // in seconds
  audioUrl: text("audio_url").notNull(),
  energy: integer("energy").default(5),
  acoustics: integer("acoustics").default(5),
  popularity: integer("popularity").default(5),
  mood: integer("mood").default(5),
  instrumental: integer("instrumental").default(5),
  experimental: integer("experimental").default(5),
  genres: json("genres").$type<string[]>().default([]),
  dateAdded: timestamp("date_added").defaultNow(),
});

export const insertTrackSchema = createInsertSchema(tracks).pick({
  title: true,
  artist: true,
  album: true,
  coverUrl: true,
  duration: true,
  audioUrl: true,
  energy: true,
  acoustics: true,
  popularity: true,
  mood: true,
  instrumental: true,
  experimental: true,
  genres: true,
});

// Artists
export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  genres: json("genres").$type<string[]>().default([]),
  popularity: integer("popularity").default(50),
});

export const insertArtistSchema = createInsertSchema(artists).pick({
  name: true,
  imageUrl: true,
  genres: true,
  popularity: true,
});

// Playlists
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlaylistSchema = createInsertSchema(playlists).pick({
  userId: true,
  name: true,
  description: true,
  imageUrl: true,
});

// Playlist Tracks Junction
export const playlistTracks = pgTable("playlist_tracks", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  trackId: integer("track_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertPlaylistTrackSchema = createInsertSchema(playlistTracks).pick({
  playlistId: true,
  trackId: true,
});

// Liked Tracks
export const likedTracks = pgTable("liked_tracks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trackId: integer("track_id").notNull(),
  likedAt: timestamp("liked_at").defaultNow(),
});

export const insertLikedTrackSchema = createInsertSchema(likedTracks).pick({
  userId: true,
  trackId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect & {
  playlists?: { id: number; name: string; trackCount: number }[];
  initials?: string;
};

export type InsertPreferences = z.infer<typeof insertPreferencesSchema>;
export type UserPreferences = Omit<typeof userPreferences.$inferSelect, "id" | "userId" | "updatedAt">;

export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracks.$inferSelect;

export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artists.$inferSelect;

export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect & {
  trackCount?: number;
};

export type InsertPlaylistTrack = z.infer<typeof insertPlaylistTrackSchema>;
export type PlaylistTrack = typeof playlistTracks.$inferSelect;

export type InsertLikedTrack = z.infer<typeof insertLikedTrackSchema>;
export type LikedTrack = typeof likedTracks.$inferSelect;
