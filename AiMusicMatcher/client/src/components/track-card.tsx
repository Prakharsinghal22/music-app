import { Play, Heart, Plus } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { Track } from "@shared/schema";

interface TrackCardProps {
  track: Track;
  matchPercentage?: number;
}

const TrackCard = ({ track, matchPercentage }: TrackCardProps) => {
  const { play, isPlaying, currentTrack } = usePlayer();
  
  const isCurrentlyPlaying = isPlaying && currentTrack?.id === track.id;

  const handlePlay = () => {
    play(track);
  };
  
  const formatDuration = (durationInSeconds: number) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="track-card bg-neutral-400 bg-opacity-20 rounded-md overflow-hidden transition hover:bg-opacity-30 cursor-pointer group">
      <div className="relative">
        <img
          src={track.coverUrl}
          alt={`${track.title} Album Cover`}
          className="w-full aspect-square object-cover"
        />
        <button 
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <Play className="h-5 w-5" />
        </button>
        {matchPercentage && (
          <div className="absolute top-2 left-2 bg-accent text-white text-xs py-1 px-2 rounded">
            <Robot className="inline-block mr-1 h-3 w-3" /> {matchPercentage}% Match
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white truncate">{track.title}</h3>
        <p className="text-neutral-300 text-sm truncate">{track.artist}</p>
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center">
            <span className="text-xs text-neutral-300 mr-3">{formatDuration(track.duration)}</span>
            <div className="flex gap-2">
              <button className="text-neutral-300 hover:text-white transition">
                <Heart className="h-4 w-4" />
              </button>
              <button className="text-neutral-300 hover:text-white transition">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <span 
                key={i} 
                className="w-1.5 h-3 bg-primary rounded-sm" 
                style={{ 
                  height: `${Math.random() * 4 + 2}px`, 
                  transform: 'scaleY(2)' 
                }} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Robot = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <rect x="9" y="7" width="6" height="4" />
    <path d="M9 7V4" />
    <path d="M15 7V4" />
    <path d="M9 15v-1" />
    <path d="M12 15v-1" />
    <path d="M15 15v-1" />
  </svg>
);

export default TrackCard;
