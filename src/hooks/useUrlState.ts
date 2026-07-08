import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function useUrlState<T extends Record<string, any>>(
  initialState: T
): [T, (newState: Partial<T>) => void, boolean] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<T>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!searchParams) return;
    const parsedState: any = { ...initialState };
    
    searchParams.forEach((value, key) => {
      if (key in initialState) {
        const type = typeof initialState[key];
        let parsedVal: any = value;
        if (type === 'number') parsedVal = parseFloat(value);
        else if (type === 'boolean') parsedVal = value === 'true';
        parsedState[key] = parsedVal;
      }
    });

    setState(parsedState);
    setIsLoaded(true);
  }, [searchParams, initialState]);

  const setUrlState = useCallback(
    (newState: Partial<T>) => {
      const merged = { ...state, ...newState };
      setState(merged);

      const params = new URLSearchParams(searchParams?.toString());
      Object.entries(merged).forEach(([key, val]) => {
        if (val === initialState[key] || val === undefined || val === '') {
          params.delete(key);
        } else {
          params.set(key, String(val));
        }
      });
      
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [state, pathname, router, searchParams, initialState]
  );

  return [state, setUrlState, isLoaded];
}
