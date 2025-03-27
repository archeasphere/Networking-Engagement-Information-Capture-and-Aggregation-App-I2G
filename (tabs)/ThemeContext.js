import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Theme Context
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useSystemColorScheme(); // Get system theme
  const [isLightMode, setIsLightMode] = useState(systemColorScheme === 'light');

  // Load theme from AsyncStorage
  useEffect(() => {
    async function loadTheme() {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsLightMode(savedTheme === 'light');
      } else {
        setIsLightMode(systemColorScheme === 'light');
      }
    }
    loadTheme();
  }, []);

  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = !isLightMode;
    setIsLightMode(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isLightMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for using theme context
export function useTheme() {
  return useContext(ThemeContext);
}
