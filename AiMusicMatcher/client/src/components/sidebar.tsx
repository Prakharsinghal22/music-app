import { Link, useLocation } from "wouter";
import { useUser } from "@/context/user-context";
import { Home, Search, Heart, History, Plus, Disc } from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useUser();

  const isActive = (path: string) => location === path;

  return (
    <div className="w-full md:w-64 bg-neutral-400 p-4 md:h-full overflow-y-auto">
      <div className="flex items-center mb-8 mt-2">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-2">
          <Music className="h-4 w-4 text-white" />
        </div>
        <h1 className="text-xl font-bold font-accent text-white">Harmony.AI</h1>
      </div>

      <nav>
        <ul>
          <li className="mb-1">
            <Link href="/">
              <a className={`flex items-center py-2 px-4 rounded-md ${isActive("/") ? "bg-primary bg-opacity-20 text-primary" : "hover:bg-neutral-300 hover:bg-opacity-20 text-white transition"}`}>
                <Home className="mr-3 h-4 w-4" />
                <span>Home</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/search">
              <a className={`flex items-center py-2 px-4 rounded-md ${isActive("/search") ? "bg-primary bg-opacity-20 text-primary" : "hover:bg-neutral-300 hover:bg-opacity-20 text-white transition"}`}>
                <Search className="mr-3 h-4 w-4" />
                <span>Search</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/liked-songs">
              <a className={`flex items-center py-2 px-4 rounded-md ${isActive("/liked-songs") ? "bg-primary bg-opacity-20 text-primary" : "hover:bg-neutral-300 hover:bg-opacity-20 text-white transition"}`}>
                <Heart className="mr-3 h-4 w-4" />
                <span>Liked Songs</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/recently-played">
              <a className={`flex items-center py-2 px-4 rounded-md ${isActive("/recently-played") ? "bg-primary bg-opacity-20 text-primary" : "hover:bg-neutral-300 hover:bg-opacity-20 text-white transition"}`}>
                <History className="mr-3 h-4 w-4" />
                <span>Recently Played</span>
              </a>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-8">
        <h3 className="uppercase text-xs tracking-wider text-neutral-300 mb-4 px-4">Your Collections</h3>
        <ul>
          {user?.playlists?.map((playlist) => (
            <li key={playlist.id} className="mb-1">
              <Link href={`/playlist/${playlist.id}`}>
                <a className="flex items-center py-2 px-4 rounded-md hover:bg-neutral-300 hover:bg-opacity-20 text-white transition">
                  <Disc className="mr-3 h-4 w-4" />
                  <span>{playlist.name}</span>
                </a>
              </Link>
            </li>
          ))}
          {!user?.playlists?.length && (
            <>
              <li className="mb-1">
                <a href="#" className="flex items-center py-2 px-4 rounded-md hover:bg-neutral-300 hover:bg-opacity-20 text-white transition">
                  <Disc className="mr-3 h-4 w-4" />
                  <span>Workout Mix</span>
                </a>
              </li>
              <li className="mb-1">
                <a href="#" className="flex items-center py-2 px-4 rounded-md hover:bg-neutral-300 hover:bg-opacity-20 text-white transition">
                  <Disc className="mr-3 h-4 w-4" />
                  <span>Chill Vibes</span>
                </a>
              </li>
              <li className="mb-1">
                <a href="#" className="flex items-center py-2 px-4 rounded-md hover:bg-neutral-300 hover:bg-opacity-20 text-white transition">
                  <Disc className="mr-3 h-4 w-4" />
                  <span>Focus Time</span>
                </a>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="mt-8 px-4">
        <button className="w-full py-2 px-4 rounded-md border border-neutral-300 text-white hover:bg-neutral-300 hover:bg-opacity-10 transition">
          <Plus className="inline-block mr-2 h-4 w-4" /> New Playlist
        </button>
      </div>

      <div className="mt-8 px-4">
        <h3 className="uppercase text-xs tracking-wider text-neutral-300 mb-4">Your Account</h3>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
            <span className="text-secondary font-bold">{user?.initials || "JS"}</span>
          </div>
          <div>
            <div className="font-medium">{user?.name || "Jamie Smith"}</div>
            <div className="text-xs text-neutral-300">{user?.subscription || "Premium User"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Music = ({ className }: { className?: string }) => (
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
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export default Sidebar;
