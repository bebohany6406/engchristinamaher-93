
import { useEffect, useState } from 'react';

// Simple hook to handle font loading
export const useFont = () => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Mark font as loaded immediately for this app
    setLoaded(true);
  }, []);
  
  return {
    loaded,
    className: 'font-tajawal',
  };
};
