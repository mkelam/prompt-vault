import { renderHook, act } from '@testing-library/react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

describe('useRecentlyViewed', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with empty recentItems array', () => {
      const { result } = renderHook(() => useRecentlyViewed());

      expect(result.current.recentItems).toEqual([]);
      expect(result.current.recentIds).toEqual([]);
      expect(result.current.count).toBe(0);
    });

    it('should load recently viewed from localStorage if available', () => {
      const storedItems = [
        { id: 'prompt-1', viewedAt: 1000 },
        { id: 'prompt-2', viewedAt: 2000 },
      ];
      localStorage.setItem('bizprompt_recently_viewed', JSON.stringify(storedItems));

      const { result } = renderHook(() => useRecentlyViewed());

      expect(result.current.recentItems).toEqual(storedItems);
      expect(result.current.recentIds).toEqual(['prompt-1', 'prompt-2']);
      expect(result.current.count).toBe(2);
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      localStorage.setItem('bizprompt_recently_viewed', 'invalid-json');

      const { result } = renderHook(() => useRecentlyViewed());

      expect(result.current.recentItems).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('addToRecent', () => {
    it('should add a prompt to recently viewed', () => {
      const { result } = renderHook(() => useRecentlyViewed());

      act(() => {
        result.current.addToRecent('prompt-1');
      });

      expect(result.current.recentIds).toContain('prompt-1');
      expect(result.current.count).toBe(1);
    });

    it('should move existing item to top when re-viewed', () => {
      const storedItems = [
        { id: 'prompt-1', viewedAt: 1000 },
        { id: 'prompt-2', viewedAt: 2000 },
      ];
      localStorage.setItem('bizprompt_recently_viewed', JSON.stringify(storedItems));

      const { result } = renderHook(() => useRecentlyViewed());

      act(() => {
        result.current.addToRecent('prompt-2');
      });

      // prompt-2 should now be first
      expect(result.current.recentIds[0]).toBe('prompt-2');
      expect(result.current.count).toBe(2); // Should not duplicate
    });

    it('should limit to 10 recent items', () => {
      const { result } = renderHook(() => useRecentlyViewed());

      act(() => {
        // Add 12 items
        for (let i = 1; i <= 12; i++) {
          result.current.addToRecent(`prompt-${i}`);
        }
      });

      expect(result.current.count).toBe(10);
      expect(result.current.recentIds).toContain('prompt-12'); // Most recent
      expect(result.current.recentIds).toContain('prompt-3'); // 10th from end
      expect(result.current.recentIds).not.toContain('prompt-1'); // Should be removed
      expect(result.current.recentIds).not.toContain('prompt-2'); // Should be removed
    });

    it('should add items at the beginning (most recent first)', () => {
      const { result } = renderHook(() => useRecentlyViewed());

      act(() => {
        result.current.addToRecent('prompt-1');
      });

      act(() => {
        result.current.addToRecent('prompt-2');
      });

      expect(result.current.recentIds[0]).toBe('prompt-2');
      expect(result.current.recentIds[1]).toBe('prompt-1');
    });
  });

  describe('clearRecentlyViewed', () => {
    it('should clear all recently viewed items', () => {
      const storedItems = [
        { id: 'prompt-1', viewedAt: 1000 },
        { id: 'prompt-2', viewedAt: 2000 },
      ];
      localStorage.setItem('bizprompt_recently_viewed', JSON.stringify(storedItems));

      const { result } = renderHook(() => useRecentlyViewed());

      expect(result.current.count).toBe(2);

      act(() => {
        result.current.clearRecentlyViewed();
      });

      expect(result.current.recentItems).toEqual([]);
      expect(result.current.recentIds).toEqual([]);
      expect(result.current.count).toBe(0);
    });
  });

  describe('localStorage persistence', () => {
    it('should save to localStorage when items change', () => {
      const { result } = renderHook(() => useRecentlyViewed());

      act(() => {
        result.current.addToRecent('prompt-1');
      });

      const saved = localStorage.getItem('bizprompt_recently_viewed');
      const savedData = JSON.parse(saved!);
      expect(savedData[0].id).toBe('prompt-1');
      expect(savedData[0].viewedAt).toBeDefined();
    });
  });
});
