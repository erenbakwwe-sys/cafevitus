import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isAutoMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Calculates whether it's currently sunset/nighttime (18:00 - 07:00)
 */
function getAutomaticDayNightTheme(): Theme {
  const currentHour = new Date().getHours();
  // Daytime: 07:00 - 18:00 (7 AM to 6 PM) -> Light mode
  // Evening/Night: 18:00 - 07:00 (6 PM to 7 AM) -> Dark mode
  return currentHour >= 18 || currentHour < 7 ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('cv-theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Default to dynamic time-based sunset detection
    return getAutomaticDayNightTheme();
  });

  const isDark = theme === 'dark';
  const isAutoMode = !localStorage.getItem('cv-theme');

  // Apply .dark class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  // Periodic check every minute to auto-transition on sunset if not manually overridden
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const manualPreference = localStorage.getItem('cv-theme');
      if (!manualPreference) {
        const autoTheme = getAutomaticDayNightTheme();
        setThemeState(autoTheme);
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, []);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('cv-theme', newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('cv-theme', next);
    setThemeState(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark, isAutoMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
