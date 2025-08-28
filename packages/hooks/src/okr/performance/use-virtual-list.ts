"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface UseVirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  getItemId?: (index: number, item: any) => string;
}

interface VirtualListReturn<T> {
  virtualItems: Array<{
    index: number;
    start: number;
    end: number;
    item: T;
    key: string;
  }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  scrollToTop: () => void;
  containerProps: {
    style: React.CSSProperties;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  };
  innerProps: {
    style: React.CSSProperties;
  };
}

/**
 * Virtual scrolling hook for large lists (story.txt line 451)
 * Renders only visible items to maintain performance with 100+ items
 */
export function useVirtualList<T>(
  items: T[],
  options: UseVirtualListOptions
): VirtualListReturn<T> {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    getItemId = (index) => `item-${index}`
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );

    // Add overscan
    const startWithOverscan = Math.max(0, start - overscan);
    const endWithOverscan = Math.min(items.length - 1, end + overscan);

    const visible = [];
    for (let i = startWithOverscan; i <= endWithOverscan; i++) {
      visible.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight,
        item: items[i],
        key: getItemId(i, items[i])
      });
    }

    return {
      startIndex: startWithOverscan,
      endIndex: endWithOverscan,
      visibleItems: visible
    };
  }, [scrollTop, itemHeight, containerHeight, items, overscan, getItemId]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      const targetScrollTop = index * itemHeight;
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, [itemHeight]);

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  return {
    virtualItems: visibleItems,
    totalHeight,
    scrollToIndex,
    scrollToTop,
    containerProps: {
      ref: containerRef,
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative' as const
      },
      onScroll: handleScroll
    },
    innerProps: {
      style: {
        height: totalHeight,
        position: 'relative' as const
      }
    }
  };
}

/**
 * Hook for debounced search input (story.txt line 456)
 */
export function useDebouncedSearch(initialValue: string = '', delay: number = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    clearSearch,
    isSearching: searchTerm !== debouncedSearchTerm
  };
}

/**
 * Throttled scroll handler (story.txt line 457)
 */
export function useThrottledScroll(
  callback: (scrollY: number) => void,
  delay: number = 100
) {
  const callbackRef = useRef(callback);
  const lastRun = useRef(Date.now());

  useEffect(() => {
    callbackRef.current = callback;
  });

  const throttledCallback = useCallback((scrollY: number) => {
    if (Date.now() - lastRun.current >= delay) {
      callbackRef.current(scrollY);
      lastRun.current = Date.now();
    }
  }, [delay]);

  useEffect(() => {
    const handleScroll = () => {
      throttledCallback(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [throttledCallback]);
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - renderStartTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${componentName} render #${renderCount.current} took ${renderTime}ms`);
    }

    renderStartTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
    markRenderStart: () => {
      renderStartTime.current = Date.now();
    }
  };
}