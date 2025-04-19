import {
  User, UserPreferences, Track, Artist, Playlist,
  InsertUser, InsertPreferences, InsertTrack, InsertArtist, InsertPlaylist
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Preferences operations
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: number, preferences: Partial<UserPreferences>): Promise<UserPreferences>;
  
  // Track operations
  getTrack(id: number): Promise<Track | undefined>;
  getTracks(): Promise<Track[]>;
  createTrack(track: InsertTrack): Promise<Track>;
  searchTracks(query: string): Promise<Track[]>;
  getArtistTopTracks(artistId: number): Promise<Track[]>;
  
  // Artist operations
  getArtist(id: number): Promise<Artist | undefined>;
  getArtists(): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  searchArtists(query: string): Promise<Artist[]>;
  
  // Playlist operations
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getUserPlaylists(userId: number): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  addTrackToPlaylist(playlistId: number, trackId: number): Promise<void>;
  removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<void>;
  
  // Liked tracks operations
  getUserLikedTracks(userId: number): Promise<Track[]>;
  likeTrack(userId: number, trackId: number): Promise<void>;
  unlikeTrack(userId: number, trackId: number): Promise<void>;
  isTrackLiked(userId: number, trackId: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private preferences: Map<number, UserPreferences>;
  private tracks: Map<number, Track>;
  private artists: Map<number, Artist>;
  private playlists: Map<number, Playlist>;
  private playlistTracks: Map<string, number>; // key: playlistId-trackId
  private likedTracks: Map<string, number>; // key: userId-trackId
  
  private nextUserId: number;
  private nextTrackId: number;
  private nextArtistId: number;
  private nextPlaylistId: number;
  
  constructor() {
    this.users = new Map();
    this.preferences = new Map();
    this.tracks = new Map();
    this.artists = new Map();
    this.playlists = new Map();
    this.playlistTracks = new Map();
    this.likedTracks = new Map();
    
    this.nextUserId = 1;
    this.nextTrackId = 1;
    this.nextArtistId = 1;
    this.nextPlaylistId = 1;
    
    // Initialize with sample data
    this.seedData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  // Preferences operations
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return this.preferences.get(userId);
  }
  
  async updateUserPreferences(userId: number, newPreferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = this.preferences.get(userId);
    
    if (!current) {
      throw new Error(`Preferences not found for user ${userId}`);
    }
    
    const updated: UserPreferences = {
      ...current,
      ...newPreferences,
    };
    
    this.preferences.set(userId, updated);
    return updated;
  }
  
  // Track operations
  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }
  
  async getTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values());
  }
  
  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const id = this.nextTrackId++;
    const track: Track = { 
      ...insertTrack, 
      id, 
      dateAdded: new Date() 
    };
    this.tracks.set(id, track);
    return track;
  }
  
  async searchTracks(query: string): Promise<Track[]> {
    query = query.toLowerCase();
    return Array.from(this.tracks.values()).filter(
      (track) => 
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.album.toLowerCase().includes(query)
    );
  }
  
  async getArtistTopTracks(artistId: number): Promise<Track[]> {
    const artist = await this.getArtist(artistId);
    
    if (!artist) {
      throw new Error(`Artist with ID ${artistId} not found`);
    }
    
    return Array.from(this.tracks.values())
      .filter(track => track.artist.toLowerCase() === artist.name.toLowerCase())
      .slice(0, 10); // Get top 10 tracks
  }
  
  // Artist operations
  async getArtist(id: number): Promise<Artist | undefined> {
    return this.artists.get(id);
  }
  
  async getArtists(): Promise<Artist[]> {
    return Array.from(this.artists.values());
  }
  
  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const id = this.nextArtistId++;
    const artist: Artist = { ...insertArtist, id };
    this.artists.set(id, artist);
    return artist;
  }
  
  async searchArtists(query: string): Promise<Artist[]> {
    query = query.toLowerCase();
    return Array.from(this.artists.values()).filter(
      (artist) => artist.name.toLowerCase().includes(query)
    );
  }
  
  // Playlist operations
  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }
  
  async getUserPlaylists(userId: number): Promise<Playlist[]> {
    const playlists = Array.from(this.playlists.values()).filter(
      (playlist) => playlist.userId === userId
    );
    
    // Add track count to each playlist
    return playlists.map(playlist => {
      const trackCount = Array.from(this.playlistTracks.keys())
        .filter(key => key.startsWith(`${playlist.id}-`))
        .length;
      
      return {
        ...playlist,
        trackCount
      };
    });
  }
  
  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = this.nextPlaylistId++;
    const playlist: Playlist = { 
      ...insertPlaylist, 
      id, 
      createdAt: new Date() 
    };
    this.playlists.set(id, playlist);
    return playlist;
  }
  
  async addTrackToPlaylist(playlistId: number, trackId: number): Promise<void> {
    const key = `${playlistId}-${trackId}`;
    this.playlistTracks.set(key, Date.now());
  }
  
  async removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<void> {
    const key = `${playlistId}-${trackId}`;
    this.playlistTracks.delete(key);
  }
  
  // Liked tracks operations
  async getUserLikedTracks(userId: number): Promise<Track[]> {
    const likedTrackIds = Array.from(this.likedTracks.keys())
      .filter(key => key.startsWith(`${userId}-`))
      .map(key => parseInt(key.split('-')[1], 10));
    
    return likedTrackIds
      .map(trackId => this.tracks.get(trackId))
      .filter((track): track is Track => track !== undefined);
  }
  
  async likeTrack(userId: number, trackId: number): Promise<void> {
    const key = `${userId}-${trackId}`;
    this.likedTracks.set(key, Date.now());
  }
  
  async unlikeTrack(userId: number, trackId: number): Promise<void> {
    const key = `${userId}-${trackId}`;
    this.likedTracks.delete(key);
  }
  
  async isTrackLiked(userId: number, trackId: number): Promise<boolean> {
    const key = `${userId}-${trackId}`;
    return this.likedTracks.has(key);
  }
  
  // Seed data for demo
  private seedData() {
    // Create a user
    const user: User = {
      id: this.nextUserId++,
      username: "demo_user",
      password: "password123", // In a real app, this would be hashed
      name: "Jamie Smith",
      email: "jamie@example.com",
      subscription: "Premium User",
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    
    // Create user preferences
    const preferences: UserPreferences = {
      energy: 7,
      acoustics: 4,
      popularity: 5,
      mood: 6,
      instrumental: 3,
      experimental: 8,
      genres: ["Indie Pop", "Electronic", "Alt Rock", "Hip Hop"]
    };
    this.preferences.set(user.id, preferences);
    
    // Create artists
    const artists = [
      {
        name: "Tame Impala",
        imageUrl: "https://via.placeholder.com/300?text=Tame+Impala",
        genres: ["Psychedelic Rock", "Indie Pop"],
        popularity: 85
      },
      {
        name: "MGMT",
        imageUrl: "https://via.placeholder.com/300?text=MGMT",
        genres: ["Indie Pop", "Psychedelic Pop"],
        popularity: 78
      },
      {
        name: "Beach House",
        imageUrl: "https://via.placeholder.com/300?text=Beach+House",
        genres: ["Dream Pop", "Indie Pop"],
        popularity: 75
      },
      {
        name: "Unknown Mortal Orchestra",
        imageUrl: "https://via.placeholder.com/300?text=UMO",
        genres: ["Psychedelic Rock", "Indie Rock"],
        popularity: 70
      },
      {
        name: "Glass Animals",
        imageUrl: "https://via.placeholder.com/300?text=Glass+Animals",
        genres: ["Indie Pop", "Psychedelic Pop"],
        popularity: 82
      }
    ];
    
    artists.forEach(artist => {
      const id = this.nextArtistId++;
      this.artists.set(id, { ...artist, id });
    });
    
    // Create tracks
    const tracks = [
      {
        title: "Midnight Echoes",
        artist: "Aurora Skies",
        album: "Neon Dreams",
        coverUrl: "https://via.placeholder.com/300?text=Neon+Dreams",
        duration: 225, // 3:45
        audioUrl: "https://example.com/audio/midnight-echoes.mp3",
        energy: 7,
        acoustics: 3,
        popularity: 6,
        mood: 7,
        instrumental: 2,
        experimental: 8,
        genres: ["Electronic", "Indie Pop"]
      },
      {
        title: "Electric Dreams",
        artist: "Neon Pulse",
        album: "Synthetic Emotions",
        coverUrl: "https://via.placeholder.com/300?text=Synthetic+Emotions",
        duration: 252, // 4:12
        audioUrl: "https://example.com/audio/electric-dreams.mp3",
        energy: 8,
        acoustics: 2,
        popularity: 5,
        mood: 8,
        instrumental: 3,
        experimental: 7,
        genres: ["Electronic", "Synth Pop"]
      },
      {
        title: "Crystal Waves",
        artist: "Lunar Echo",
        album: "Ocean Whispers",
        coverUrl: "https://via.placeholder.com/300?text=Ocean+Whispers",
        duration: 237, // 3:57
        audioUrl: "https://example.com/audio/crystal-waves.mp3",
        energy: 5,
        acoustics: 6,
        popularity: 4,
        mood: 6,
        instrumental: 4,
        experimental: 5,
        genres: ["Ambient", "Electronic"]
      },
      {
        title: "Neon Heights",
        artist: "Synth Collective",
        album: "Digital Horizons",
        coverUrl: "https://via.placeholder.com/300?text=Digital+Horizons",
        duration: 270, // 4:30
        audioUrl: "https://example.com/audio/neon-heights.mp3",
        energy: 9,
        acoustics: 2,
        popularity: 7,
        mood: 9,
        instrumental: 2,
        experimental: 6,
        genres: ["Electronic", "Dance"]
      },
      {
        title: "Let It Happen",
        artist: "Tame Impala",
        album: "Currents",
        coverUrl: "https://via.placeholder.com/300?text=Currents",
        duration: 467, // 7:47
        audioUrl: "https://example.com/audio/let-it-happen.mp3",
        energy: 8,
        acoustics: 4,
        popularity: 9,
        mood: 7,
        instrumental: 3,
        experimental: 7,
        genres: ["Psychedelic Rock", "Indie Pop"]
      },
      {
        title: "The Less I Know The Better",
        artist: "Tame Impala",
        album: "Currents",
        coverUrl: "https://via.placeholder.com/300?text=Currents",
        duration: 219, // 3:39
        audioUrl: "https://example.com/audio/the-less-i-know-the-better.mp3",
        energy: 7,
        acoustics: 5,
        popularity: 10,
        mood: 6,
        instrumental: 2,
        experimental: 6,
        genres: ["Psychedelic Rock", "Indie Pop"]
      },
      {
        title: "Feels Like We Only Go Backwards",
        artist: "Tame Impala",
        album: "Lonerism",
        coverUrl: "https://via.placeholder.com/300?text=Lonerism",
        duration: 194, // 3:14
        audioUrl: "https://example.com/audio/feels-like-we-only-go-backwards.mp3",
        energy: 6,
        acoustics: 4,
        popularity: 8,
        mood: 5,
        instrumental: 3,
        experimental: 7,
        genres: ["Psychedelic Rock", "Indie Rock"]
      },
      {
        title: "Electric Feel",
        artist: "MGMT",
        album: "Oracular Spectacular",
        coverUrl: "https://via.placeholder.com/300?text=Oracular+Spectacular",
        duration: 229, // 3:49
        audioUrl: "https://example.com/audio/electric-feel.mp3",
        energy: 7,
        acoustics: 5,
        popularity: 9,
        mood: 8,
        instrumental: 2,
        experimental: 6,
        genres: ["Indie Pop", "Psychedelic Pop"]
      },
      {
        title: "Kids",
        artist: "MGMT",
        album: "Oracular Spectacular",
        coverUrl: "https://via.placeholder.com/300?text=Oracular+Spectacular",
        duration: 285, // 4:45
        audioUrl: "https://example.com/audio/kids.mp3",
        energy: 8,
        acoustics: 3,
        popularity: 10,
        mood: 9,
        instrumental: 2,
        experimental: 5,
        genres: ["Indie Pop", "Synth Pop"]
      },
      {
        title: "Space Song",
        artist: "Beach House",
        album: "Depression Cherry",
        coverUrl: "https://via.placeholder.com/300?text=Depression+Cherry",
        duration: 321, // 5:21
        audioUrl: "https://example.com/audio/space-song.mp3",
        energy: 5,
        acoustics: 6,
        popularity: 8,
        mood: 5,
        instrumental: 4,
        experimental: 6,
        genres: ["Dream Pop", "Indie Pop"]
      }
    ];
    
    tracks.forEach(track => {
      const id = this.nextTrackId++;
      this.tracks.set(id, { ...track, id, dateAdded: new Date() });
    });
    
    // Create playlists
    const playlists = [
      {
        userId: user.id,
        name: "Workout Mix",
        description: "High energy tracks for workouts",
        imageUrl: "https://via.placeholder.com/300?text=Workout+Mix"
      },
      {
        userId: user.id,
        name: "Chill Vibes",
        description: "Relaxing tunes for unwinding",
        imageUrl: "https://via.placeholder.com/300?text=Chill+Vibes"
      },
      {
        userId: user.id,
        name: "Focus Time",
        description: "Concentration-enhancing tracks",
        imageUrl: "https://via.placeholder.com/300?text=Focus+Time"
      }
    ];
    
    playlists.forEach(playlist => {
      const id = this.nextPlaylistId++;
      this.playlists.set(id, { ...playlist, id, createdAt: new Date() });
    });
    
    // Add tracks to playlists
    // Workout Mix (playlist ID 1)
    this.playlistTracks.set("1-1", Date.now()); // Midnight Echoes
    this.playlistTracks.set("1-2", Date.now()); // Electric Dreams
    this.playlistTracks.set("1-4", Date.now()); // Neon Heights
    this.playlistTracks.set("1-9", Date.now()); // Kids
    
    // Chill Vibes (playlist ID 2)
    this.playlistTracks.set("2-3", Date.now()); // Crystal Waves
    this.playlistTracks.set("2-7", Date.now()); // Feels Like We Only Go Backwards
    this.playlistTracks.set("2-10", Date.now()); // Space Song
    
    // Focus Time (playlist ID 3)
    this.playlistTracks.set("3-5", Date.now()); // Let It Happen
    this.playlistTracks.set("3-8", Date.now()); // Electric Feel
    
    // Add liked tracks for the user
    this.likedTracks.set(`${user.id}-5`, Date.now()); // Let It Happen
    this.likedTracks.set(`${user.id}-6`, Date.now()); // The Less I Know The Better
    this.likedTracks.set(`${user.id}-8`, Date.now()); // Electric Feel
    this.likedTracks.set(`${user.id}-10`, Date.now()); // Space Song
  }
}

// Create and export the storage instance
export const storage = new MemStorage();
