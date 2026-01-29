import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = 'user_theme_preference';

export const Colors = {
  light: {
    background: '#FAFAF5', // Bone / Off-White
    text: '#1A2E05',       // Deep Army Green
    card: '#FFFFFF',       // Pure White
    border: '#E2E2DC',     // Warm Grey
    icon: '#5F6F52',       // Sage Green
    tint: '#1A2E05',       // Deep Army Green
    subtext: '#5F6F52',    // Sage Green
    primary: '#D97706',    // Burnt Orange (Accent)
    secondary: '#E8EAE6',  // Light Sage
    danger: '#EF4444',     // Standard Red
  },
  dark: {
    background: '#000000',
    text: '#FFFFFF',
    card: '#1C1C1E',
    border: '#2C2C2E',
    icon: '#9CA3AF',
    tint: '#FFFFFF',
    subtext: '#A1A1AA',
    primary: '#FFFFFF',
    secondary: '#27272A',
    danger: '#FF453A',
  }
};

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: Colors.light,
  toggleTheme: () => {},
  isDark: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('light'); // Default to light initially

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setTheme(savedTheme as ThemeType);
      } else if (systemScheme) {
        setTheme(systemScheme as ThemeType);
      }
    } catch (error) {
      console.error('Failed to load theme preference', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const value = {
    theme,
    colors: Colors[theme],
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);