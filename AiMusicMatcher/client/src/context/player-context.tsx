import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Track } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  play: (track: Track) => void;
  playArtist: (artistId: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);

  const play = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const playArtist = useCallback(async (artistId: number) => {
    try {
      const response = await apiRequest('GET', `/api/artists/${artistId}/top-tracks`, undefined);
      const tracks = await response.json();
      
      if (tracks && tracks.length > 0) {
        setCurrentTrack(tracks[0]);
        setQueue(tracks.slice(1));
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to load artist tracks:', error);
    }
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      const newQueue = queue.slice(1);
      setCurrentTrack(nextTrack);
      setQueue(newQueue);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [queue]);

  const previousTrack = useCallback(() => {
    // For simplicity, we'll just restart the current track
    // In a real implementation, this would maintain a history of played tracks
    if (currentTrack) {
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  useEffect(() => {
    // Clean up audio when component unmounts
    return () => {
      setIsPlaying(false);
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        play,
        playArtist,
        togglePlay,
        nextTrack,
        previousTrack,
        addToQueue,
        clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
