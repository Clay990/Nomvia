import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'user_theme_preference';

export const Colors = {
  light: {
    background: '#FFFFFF', 
    text: '#000000',       
    card: '#FFFFFF',      
    border: '#E5E5E5',    
    icon: '#000000',     
    tint: '#000000',       
    subtext: '#666666',   
    primary: '#000000',   
    secondary: '#F4F4F4', 
    danger: '#EF4444',   
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
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setTheme(savedTheme as ThemeType);
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