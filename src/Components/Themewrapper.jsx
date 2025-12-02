import React from 'react';
import { useTheme } from '../themeContext';

const ThemeWrapper = ({ children, className = "" }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`${className} ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      {children}
    </div>
  );
};

export default ThemeWrapper;