import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserPreferences } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface UserContextType {
  user: User | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const userResponse = await apiRequest('GET', '/api/user/current', undefined);
        const userData = await userResponse.json();
        setUser(userData);
        
        const preferencesResponse = await apiRequest('GET', '/api/user/preferences', undefined);
        const preferencesData = await preferencesResponse.json();
        setPreferences(preferencesData);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load user data');
        
        // Set default user and preferences for demo purposes
        setUser({
          id: 1,
          username: 'demo_user',
          name: 'Jamie Smith',
          email: 'jamie@example.com',
          subscription: 'Premium User',
          initials: 'JS',
          playlists: [
            { id: 1, name: 'Workout Mix', trackCount: 23 },
            { id: 2, name: 'Chill Vibes', trackCount: 45 },
            { id: 3, name: 'Focus Time', trackCount: 18 }
          ]
        });
        
        setPreferences({
          energy: 7,
          acoustics: 4,
          popularity: 5,
          mood: 6,
          instrumental: 3,
          experimental: 8,
          genres: ['Indie Pop', 'Electronic', 'Alt Rock', 'Hip Hop']
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      setIsLoading(true);
      
      // Optimistic update
      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);
      
      await apiRequest('PATCH', '/api/user/preferences', newPreferences);
    } catch (err) {
      console.error('Failed to update preferences:', err);
      setError('Failed to update preferences');
      
      // Revert on error
      const preferencesResponse = await apiRequest('GET', '/api/user/preferences', undefined);
      const preferencesData = await preferencesResponse.json();
      setPreferences(preferencesData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        preferences,
        isLoading,
        error,
        updatePreferences,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
