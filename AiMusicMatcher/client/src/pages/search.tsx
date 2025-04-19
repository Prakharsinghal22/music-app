import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TrackCard from "@/components/track-card";
import ArtistCard from "@/components/artist-card";
import { Track, Artist } from "@shared/schema";
import { Search as SearchIcon, Disc, User, X } from "lucide-react";

enum SearchType {
  ALL = "all",
  TRACKS = "tracks",
  ARTISTS = "artists",
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchType>(SearchType.ALL);
  
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest(
        "GET", 
        `/api/search?q=${encodeURIComponent(query)}&type=${activeFilter}`,
        undefined
      );
      return response.json();
    },
  });
  
  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchMutation.mutate(searchTerm);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  const clearSearch = () => {
    setSearchTerm("");
    searchMutation.reset();
  };
  
  return (
    <main className="p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Search</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search for songs, artists..."
              className="w-full py-3 px-4 pl-11 rounded-lg bg-neutral-400 bg-opacity-40 border border-neutral-300 border-opacity-20 focus:outline-none focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300 h-5 w-5" />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter(SearchType.ALL)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeFilter === SearchType.ALL
                  ? "bg-primary text-white"
                  : "bg-neutral-400 bg-opacity-40 text-neutral-200 hover:bg-opacity-60"
              }`}
            >
              <span>All</span>
            </button>
            <button
              onClick={() => setActiveFilter(SearchType.TRACKS)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeFilter === SearchType.TRACKS
                  ? "bg-primary text-white"
                  : "bg-neutral-400 bg-opacity-40 text-neutral-200 hover:bg-opacity-60"
              }`}
            >
              <Disc className="h-4 w-4" />
              <span>Tracks</span>
            </button>
            <button
              onClick={() => setActiveFilter(SearchType.ARTISTS)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeFilter === SearchType.ARTISTS
                  ? "bg-primary text-white"
                  : "bg-neutral-400 bg-opacity-40 text-neutral-200 hover:bg-opacity-60"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Artists</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search Results */}
      <div className="min-h-[60vh]">
        {searchMutation.isPending && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {searchMutation.isError && (
          <div className="bg-destructive bg-opacity-20 text-destructive p-4 rounded-lg mb-8">
            <p>Failed to fetch search results. Please try again.</p>
          </div>
        )}

        {searchMutation.isSuccess && (
          <div className="space-y-8">
            {(!searchMutation.data.tracks || searchMutation.data.tracks.length === 0) && 
             (!searchMutation.data.artists || searchMutation.data.artists.length === 0) && (
              <div className="text-center py-12">
                <p className="text-neutral-300 mb-2">No results found for "{searchTerm}"</p>
                <p className="text-sm text-neutral-400">Try different keywords or check your spelling</p>
              </div>
            )}

            {(activeFilter === SearchType.ALL || activeFilter === SearchType.TRACKS) && 
             searchMutation.data.tracks && searchMutation.data.tracks.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">Tracks</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchMutation.data.tracks.map((track: Track) => (
                    <TrackCard key={track.id} track={track} />
                  ))}
                </div>
              </section>
            )}

            {(activeFilter === SearchType.ALL || activeFilter === SearchType.ARTISTS) && 
             searchMutation.data.artists && searchMutation.data.artists.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">Artists</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchMutation.data.artists.map((artist: Artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {!searchMutation.isPending && !searchMutation.isSuccess && (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 mx-auto text-neutral-300 mb-4 opacity-50" />
            <p className="text-neutral-300 mb-2">Search for your favorite music</p>
            <p className="text-sm text-neutral-400">Find tracks, artists, and more</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Search;
