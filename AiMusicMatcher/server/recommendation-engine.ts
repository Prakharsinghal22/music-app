import { UserPreferences, Track, Artist } from "@shared/schema";
import { storage } from "./storage";

class RecommendationEngine {
  // Get personalized recommendations based on user preferences
  async getRecommendations(preferences: UserPreferences): Promise<(Track & { matchPercentage: number })[]> {
    const allTracks = await storage.getTracks();
    
    // Calculate match percentage for each track based on user preferences
    const tracksWithScore = allTracks.map(track => {
      const matchScore = this.calculateMatchScore(track, preferences);
      return {
        ...track,
        matchPercentage: Math.round(matchScore * 100)
      };
    });
    
    // Sort by match percentage descending
    const sortedTracks = tracksWithScore.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    // Return top recommendations (excluding tracks with very low match)
    return sortedTracks
      .filter(track => track.matchPercentage > 50)
      .slice(0, 8);
  }
  
  // Get artist-based recommendations
  async getArtistRecommendations(artistId: number): Promise<(Artist & { similarityPercentage: number })[]> {
    const targetArtist = await storage.getArtist(artistId);
    
    if (!targetArtist) {
      throw new Error(`Artist with ID ${artistId} not found`);
    }
    
    const allArtists = await storage.getArtists();
    
    // Calculate similarity percentage for each artist
    const artistsWithSimilarity = allArtists
      .filter(artist => artist.id !== artistId) // Exclude the target artist
      .map(artist => {
        const similarityScore = this.calculateArtistSimilarity(targetArtist, artist);
        return {
          ...artist,
          similarityPercentage: Math.round(similarityScore * 100)
        };
      });
    
    // Sort by similarity percentage descending
    const sortedArtists = artistsWithSimilarity.sort(
      (a, b) => b.similarityPercentage - a.similarityPercentage
    );
    
    // Return top similar artists
    return sortedArtists.slice(0, 4);
  }
  
  // Calculate how well a track matches user preferences (0 to 1)
  private calculateMatchScore(track: Track, preferences: UserPreferences): number {
    // Define weights for different attributes
    const weights = {
      energy: 0.2,
      acoustics: 0.15,
      popularity: 0.1,
      mood: 0.2,
      instrumental: 0.15,
      experimental: 0.2
    };
    
    // Calculate weighted score for each attribute
    let score = 0;
    let totalWeight = 0;
    
    // Calculate how close the track's attributes are to user preferences
    score += weights.energy * (1 - Math.abs(track.energy - preferences.energy) / 10);
    score += weights.acoustics * (1 - Math.abs(track.acoustics - preferences.acoustics) / 10);
    score += weights.popularity * (1 - Math.abs(track.popularity - preferences.popularity) / 10);
    score += weights.mood * (1 - Math.abs(track.mood - preferences.mood) / 10);
    score += weights.instrumental * (1 - Math.abs(track.instrumental - preferences.instrumental) / 10);
    score += weights.experimental * (1 - Math.abs(track.experimental - preferences.experimental) / 10);
    
    totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    // Base score from attribute matching
    let matchScore = score / totalWeight;
    
    // Boost score if track has genres that match user preferences
    const genreBoost = this.calculateGenreOverlap(track.genres, preferences.genres);
    matchScore = matchScore * 0.7 + genreBoost * 0.3;
    
    return Math.min(1, Math.max(0, matchScore)); // Ensure score is between 0 and 1
  }
  
  // Calculate artist similarity (0 to 1)
  private calculateArtistSimilarity(artist1: Artist, artist2: Artist): number {
    // Calculate genre overlap
    const genreOverlap = this.calculateGenreOverlap(artist1.genres, artist2.genres);
    
    // Calculate popularity similarity (closer = more similar)
    const popularityDiff = Math.abs(artist1.popularity - artist2.popularity) / 100;
    const popularitySimilarity = 1 - popularityDiff;
    
    // Weighted combination of factors
    const similarity = genreOverlap * 0.7 + popularitySimilarity * 0.3;
    
    return similarity;
  }
  
  // Calculate genre overlap between two genre arrays (0 to 1)
  private calculateGenreOverlap(genres1: string[], genres2: string[]): number {
    if (!genres1.length || !genres2.length) return 0;
    
    const normalizedGenres1 = genres1.map(g => g.toLowerCase());
    const normalizedGenres2 = genres2.map(g => g.toLowerCase());
    
    // Count matching genres
    let matches = 0;
    for (const genre of normalizedGenres1) {
      if (normalizedGenres2.includes(genre)) {
        matches++;
      }
    }
    
    // Calculate Jaccard similarity: intersection size / union size
    const unionSize = new Set([...normalizedGenres1, ...normalizedGenres2]).size;
    return matches / unionSize;
  }
}

export const recommendationEngine = new RecommendationEngine();
