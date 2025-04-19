import { useState, useEffect } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Heart, Plus, Mic, List, Volume, Volume2, VolumeX
} from "lucide-react";
import { usePlayer } from "@/context/player-context";

const MusicPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    previousTrack 
  } = usePlayer();
  
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + 1;
          if (newTime >= currentTrack.duration) {
            nextTrack();
            return 0;
          }
          
          setProgress((newTime / currentTrack.duration) * 100);
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, nextTrack]);
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    
    if (currentTrack) {
      const newTime = (newProgress / 100) * currentTrack.duration;
      setCurrentTime(newTime);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };
  
  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-400 bg-opacity-95 backdrop-blur-sm border-t border-neutral-300 border-opacity-20 py-3 px-4 z-50">
      <div className="flex flex-col md:flex-row items-center">
        {currentTrack ? (
          <>
            <div className="flex items-center w-full md:w-1/3 mb-3 md:mb-0">
              <img
                src={currentTrack.coverUrl}
                alt="Now Playing"
                className="w-12 h-12 rounded object-cover mr-3"
              />
              <div className="mr-4">
                <div className="font-medium text-white">{currentTrack.title}</div>
                <div className="text-sm text-neutral-300">{currentTrack.artist}</div>
              </div>
              <div className="flex items-center">
                <button className="text-neutral-300 hover:text-white transition mr-3">
                  <Heart className="h-4 w-4" />
                </button>
                <button className="text-neutral-300 hover:text-white transition">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 mb-3 md:mb-0">
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-2">
                  <button 
                    onClick={toggleShuffle}
                    className={`mx-2 hover:text-white transition ${isShuffle ? 'text-primary' : 'text-neutral-300'}`}
                  >
                    <Shuffle className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={previousTrack}
                    className="mx-2 text-neutral-300 hover:text-white transition"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="mx-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  <button 
                    onClick={nextTrack}
                    className="mx-2 text-neutral-300 hover:text-white transition"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={toggleRepeat}
                    className={`mx-2 hover:text-white transition ${isRepeat ? 'text-primary' : 'text-neutral-300'}`}
                  >
                    <Repeat className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center w-full">
                  <span className="text-xs text-neutral-300 mr-3">{formatTime(currentTime)}</span>
                  <div className="relative flex-1 h-1 bg-neutral-300 bg-opacity-30 rounded-full">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressChange}
                      className="absolute w-full h-1 opacity-0 cursor-pointer z-10"
                    />
                    <div 
                      className="absolute h-1 bg-primary rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                    <div 
                      className="absolute h-3 w-3 bg-white rounded-full shadow-md"
                      style={{ 
                        left: `${progress}%`, 
                        top: '50%', 
                        transform: 'translate(-50%, -50%)' 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-neutral-300 ml-3">
                    {currentTrack ? formatTime(currentTrack.duration) : '0:00'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 flex justify-end items-center">
              <button className="mx-2 text-neutral-300 hover:text-white transition">
                <Mic className="h-4 w-4" />
              </button>
              <button className="mx-2 text-neutral-300 hover:text-white transition">
                <List className="h-4 w-4" />
              </button>
              <div className="flex items-center ml-3">
                <button 
                  onClick={toggleMute}
                  className="mr-2 text-neutral-300 hover:text-white transition"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : volume < 40 ? (
                    <Volume className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <div className="relative w-20 h-1 bg-neutral-300 bg-opacity-30 rounded-full cursor-pointer">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="absolute w-full h-1 opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className="absolute h-1 bg-primary rounded-full"
                    style={{ width: `${isMuted ? 0 : volume}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full text-center py-2">
            <p className="text-sm text-neutral-300">Select a track to play</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;
