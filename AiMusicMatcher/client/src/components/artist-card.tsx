import { Play, UserPlus } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { Artist } from "@shared/schema";

interface ArtistCardProps {
  artist: Artist;
  similarityPercentage?: number;
}

const ArtistCard = ({ artist, similarityPercentage }: ArtistCardProps) => {
  const { playArtist } = usePlayer();

  const handlePlay = () => {
    playArtist(artist.id);
  };

  return (
    <div className="artist-card bg-neutral-400 bg-opacity-20 rounded-md overflow-hidden transition hover:bg-opacity-30 cursor-pointer group">
      <div className="relative">
        <img
          src={artist.imageUrl}
          alt={`${artist.name} Photo`}
          className="w-full aspect-square object-cover"
        />
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <Play className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white truncate">{artist.name}</h3>
        <p className="text-neutral-300 text-sm truncate">Artist</p>
        <div className="flex justify-between items-center mt-3">
          {similarityPercentage && (
            <div className="text-xs bg-accent bg-opacity-20 text-accent px-2 py-1 rounded-full">
              <Robot className="inline-block mr-1 h-3 w-3" /> {similarityPercentage}% Similar
            </div>
          )}
          <button className="text-neutral-300 hover:text-white transition">
            <UserPlus className="h-4 w-4" />
          </button>
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

export default ArtistCard;
