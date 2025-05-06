import { useEffect } from 'react';

// A simple provider that applies a dark mode class to the root of the document based on whether the user has it enabled or not
export default function ThemeProvider({ dark }: { dark: boolean }) {
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [dark]);

  return null;
}

