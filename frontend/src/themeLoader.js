// src/components/ThemeLoader.js
import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { ThemeContext } from './Theme';

const ThemeLoader = ({ children }) => {
  const { mode } = useContext(ThemeContext);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div style={{
        visibility: 'hidden',
        backgroundColor: mode === 'dark' ? '#121212' : '#ffffff'
      }} />
    );
  }

  return children;
};

export default ThemeLoader;