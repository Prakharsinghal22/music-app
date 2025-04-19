import { useQuery } from "@tanstack/react-query";
import TrackCard from "@/components/track-card";
import { Track } from "@shared/schema";
import { Heart, Play, Clock, Plus } from "lucide-react";

const LikedSongs = () => {
  const { data: likedTracks, isLoading } = useQuery({
    queryKey: ['/api/user/liked-tracks']
  });

  return (
    <main className="p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-6">
          <div className="h-32 w-32 md:h-48 md:w-48 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center rounded-lg shadow-lg">
            <Heart className="h-16 w-16 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-300 mb-1">Playlist</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Liked Songs</h1>
            <div className="flex items-center text-sm text-neutral-300">
              <span className="font-medium text-white mr-1">Your Name</span> • 
              <span className="mx-1">{likedTracks?.length || 0} songs</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-opacity-90 transition shadow-lg">
            <Play className="h-6 w-6" />
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 border-opacity-20 text-neutral-200 hover:border-opacity-40 transition">
            <Plus className="h-4 w-4" /> Add to playlist
          </button>
        </div>
      </header>

      {/* Tracks List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div>
          {likedTracks && likedTracks.length > 0 ? (
            <div className="overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-neutral-300 border-opacity-20 text-left text-sm text-neutral-300">
                    <th className="px-4 py-2 w-12">#</th>
                    <th className="px-4 py-2">Title</th>
                    <th className="px-4 py-2 hidden md:table-cell">Album</th>
                    <th className="px-4 py-2 hidden lg:table-cell">Date Added</th>
                    <th className="px-4 py-2 text-right">
                      <Clock className="h-4 w-4 inline-block" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {likedTracks.map((track: Track, index: number) => (
                    <tr
                      key={track.id}
                      className="border-b border-neutral-300 border-opacity-10 hover:bg-neutral-400 hover:bg-opacity-20 transition-colors"
                    >
                      <td className="px-4 py-3 text-neutral-300">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-10 h-10 mr-3 rounded"
                          />
                          <div>
                            <div className="font-medium text-white">{track.title}</div>
                            <div className="text-sm text-neutral-300">{track.artist}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-300 hidden md:table-cell">
                        {track.album}
                      </td>
                      <td className="px-4 py-3 text-neutral-300 hidden lg:table-cell">
                        {track.dateAdded || "2 days ago"}
                      </td>
                      <td className="px-4 py-3 text-neutral-300 text-right">
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto text-neutral-300 mb-4 opacity-50" />
              <h2 className="text-xl font-medium mb-2">Songs you like will appear here</h2>
              <p className="text-neutral-300 mb-6">Save songs by tapping the heart icon</p>
              <button className="px-6 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition">
                Find songs
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default LikedSongs;
