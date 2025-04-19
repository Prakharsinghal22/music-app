import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Repeat } from "lucide-react";
import TrackCard from "@/components/track-card";
import ArtistCard from "@/components/artist-card";
import PreferenceSlider from "@/components/preference-slider";
import { useUser } from "@/context/user-context";
import { UserPreferences, Track, Artist } from "@shared/schema";

const Home = () => {
  const { preferences, updatePreferences } = useUser();
  const [localPreferences, setLocalPreferences] = useState<UserPreferences | null>(null);
  
  useEffect(() => {
    if (preferences && !localPreferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences, localPreferences]);

  const { data: recommendations, isLoading: recommendationsLoading, refetch: refetchRecommendations } = useQuery({
    queryKey: ['/api/recommendations'],
    enabled: !!localPreferences
  });

  const { data: artistRecommendations, isLoading: artistRecommendationsLoading } = useQuery({
    queryKey: ['/api/artist-recommendations'],
    enabled: !!localPreferences
  });

  const handlePreferenceChange = (name: keyof UserPreferences, value: number) => {
    if (localPreferences) {
      setLocalPreferences({ ...localPreferences, [name]: value });
    }
  };

  const regenerateRecommendations = async () => {
    if (localPreferences) {
      await updatePreferences(localPreferences);
      refetchRecommendations();
    }
  };

  if (!localPreferences) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Discover New Music</h1>
          <p className="text-neutral-300">AI-powered recommendations based on your preferences</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for songs, artists..."
              className="w-full md:w-64 py-2 px-4 pr-10 rounded-full bg-neutral-400 bg-opacity-40 border border-neutral-300 border-opacity-20 focus:outline-none focus:border-primary"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* AI Preferences Section */}
      <section className="mb-12 p-6 rounded-lg bg-neutral-400 bg-opacity-30 border border-neutral-300 border-opacity-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <span className="bg-accent text-white p-1 rounded-md mr-2">
                <Robot className="h-5 w-5" />
              </span>
              Fine-tune Your AI Recommendations
            </h2>
            <p className="text-neutral-300 mt-1">Adjust these settings to get more personalized music suggestions</p>
          </div>
          <button
            onClick={regenerateRecommendations}
            className="mt-4 md:mt-0 py-2 px-4 bg-accent rounded-md text-white hover:bg-opacity-90 transition flex items-center"
          >
            <Repeat className="mr-2 h-4 w-4" /> Refresh Recommendations
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PreferenceSlider
            name="Energy Level"
            initialValue={localPreferences.energy}
            leftLabel="Calm"
            rightLabel="Energetic"
            onChange={(value) => handlePreferenceChange("energy", value)}
          />
          
          <PreferenceSlider
            name="Acoustics"
            initialValue={localPreferences.acoustics}
            leftLabel="Electronic"
            rightLabel="Acoustic"
            onChange={(value) => handlePreferenceChange("acoustics", value)}
          />
          
          <PreferenceSlider
            name="Popularity"
            initialValue={localPreferences.popularity}
            leftLabel="Underground"
            rightLabel="Mainstream"
            onChange={(value) => handlePreferenceChange("popularity", value)}
          />
          
          <PreferenceSlider
            name="Mood"
            initialValue={localPreferences.mood}
            leftLabel="Melancholic"
            rightLabel="Upbeat"
            onChange={(value) => handlePreferenceChange("mood", value)}
          />
          
          <PreferenceSlider
            name="Instrumental"
            initialValue={localPreferences.instrumental}
            leftLabel="Vocal-based"
            rightLabel="Instrumental"
            onChange={(value) => handlePreferenceChange("instrumental", value)}
          />
          
          <PreferenceSlider
            name="Experimental"
            initialValue={localPreferences.experimental}
            leftLabel="Traditional"
            rightLabel="Experimental"
            onChange={(value) => handlePreferenceChange("experimental", value)}
          />
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            <div className="text-sm font-medium mr-2 flex items-center">
              <span>Your Top Genres:</span>
            </div>
            {localPreferences.genres.map((genre, index) => (
              <span key={index} className="bg-accent bg-opacity-20 text-accent text-sm px-3 py-1 rounded-full">
                {genre}
              </span>
            ))}
            <span className="bg-accent bg-opacity-20 text-accent text-sm px-3 py-1 rounded-full cursor-pointer">
              + Add More
            </span>
          </div>
        </div>
      </section>

      {/* Recommended Tracks */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recommended For You Today</h2>
          <a href="#" className="text-primary hover:text-primary-dark text-sm flex items-center">
            See All <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </div>

        {recommendationsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-neutral-400 bg-opacity-20 rounded-md overflow-hidden h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendations?.map((track: Track & { matchPercentage: number }) => (
              <TrackCard 
                key={track.id} 
                track={track} 
                matchPercentage={track.matchPercentage} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Artist Based Recommendations */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Because You Like Tame Impala</h2>
          <a href="#" className="text-primary hover:text-primary-dark text-sm flex items-center">
            See All <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </div>

        {artistRecommendationsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-neutral-400 bg-opacity-20 rounded-md overflow-hidden h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artistRecommendations?.map((artist: Artist & { similarityPercentage: number }) => (
              <ArtistCard 
                key={artist.id} 
                artist={artist} 
                similarityPercentage={artist.similarityPercentage} 
              />
            ))}
          </div>
        )}
      </section>

      {/* AI Insights */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">AI Insights</h2>
          <a href="#" className="text-primary hover:text-primary-dark text-sm flex items-center">
            See All <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </div>

        <div className="bg-neutral-400 bg-opacity-20 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <span className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mr-3">
                  <LineChart className="h-5 w-5 text-white" />
                </span>
                <h3 className="text-lg font-bold">Your Listening Patterns</h3>
              </div>

              <div className="space-y-4">
                <p className="text-neutral-200">Based on your listening history, you've been exploring these genres:</p>

                <div className="space-y-3">
                  {preferences?.genres.map((genre, index) => {
                    const percentage = [42, 27, 18, 13][index] || Math.floor(Math.random() * 20) + 5;
                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{genre}</span>
                          <span className="text-sm text-primary">{percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-300 bg-opacity-30 rounded-full">
                          <div className="h-2 bg-primary rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center mb-4">
                <span className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mr-3">
                  <Lightbulb className="h-5 w-5 text-white" />
                </span>
                <h3 className="text-lg font-bold">Personalized Recommendations</h3>
              </div>

              <div className="space-y-4">
                <p className="text-neutral-200">You might want to explore these emerging artists:</p>

                <ul className="space-y-2">
                  <li className="flex justify-between items-center p-2 rounded hover:bg-neutral-400 hover:bg-opacity-30 transition cursor-pointer">
                    <div className="flex items-center">
                      <img
                        src="https://via.placeholder.com/50?text=VH"
                        alt="Artist"
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                      <div>
                        <div className="font-medium">Velvet Horizon</div>
                        <div className="text-xs text-neutral-300">Similar to Tame Impala</div>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-neutral-400 bg-opacity-30 flex items-center justify-center hover:bg-primary transition">
                      <Play className="h-4 w-4" />
                    </button>
                  </li>

                  <li className="flex justify-between items-center p-2 rounded hover:bg-neutral-400 hover:bg-opacity-30 transition cursor-pointer">
                    <div className="flex items-center">
                      <img
                        src="https://via.placeholder.com/50?text=LE"
                        alt="Artist"
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                      <div>
                        <div className="font-medium">Lunar Echo</div>
                        <div className="text-xs text-neutral-300">Similar to MGMT</div>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-neutral-400 bg-opacity-30 flex items-center justify-center hover:bg-primary transition">
                      <Play className="h-4 w-4" />
                    </button>
                  </li>

                  <li className="flex justify-between items-center p-2 rounded hover:bg-neutral-400 hover:bg-opacity-30 transition cursor-pointer">
                    <div className="flex items-center">
                      <img
                        src="https://via.placeholder.com/50?text=ND"
                        alt="Artist"
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                      <div>
                        <div className="font-medium">Neon Drift</div>
                        <div className="text-xs text-neutral-300">Similar to Glass Animals</div>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-neutral-400 bg-opacity-30 flex items-center justify-center hover:bg-primary transition">
                      <Play className="h-4 w-4" />
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const Robot = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
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

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const LineChart = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="22" y1="12" x2="2" y2="12" />
    <polyline points="5 19 2 12 5 5" />
    <polyline points="19 5 22 12 19 19" />
  </svg>
);

const Lightbulb = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const Play = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export default Home;
