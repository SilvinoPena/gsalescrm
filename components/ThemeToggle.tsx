
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { ICONS } from '../constants';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? ICONS.moon : ICONS.sun}
    </button>
  );
};

export default ThemeToggle;
