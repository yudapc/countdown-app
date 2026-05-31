import { useEffect, useState } from 'react';

const useLocalStorageState = (storageKey, initialValue) => {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === null) {
      return initialValue;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue];
};

export default useLocalStorageState;
