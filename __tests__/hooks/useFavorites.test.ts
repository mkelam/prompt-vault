import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '@/hooks/useFavorites';

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with empty favorites array', () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual([]);
      expect(result.current.count).toBe(0);
    });

    it('should load favorites from localStorage if available', () => {
      localStorage.setItem('bizprompt_favorites', JSON.stringify(['prompt-1', 'prompt-2']));

      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual(['prompt-1', 'prompt-2']);
      expect(result.current.count).toBe(2);
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      localStorage.setItem('bizprompt_favorites', 'invalid-json');

      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('addFavorite', () => {
    it('should add a prompt to favorites', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('prompt-1');
      });

      expect(result.current.favorites).toContain('prompt-1');
      expect(result.current.count).toBe(1);
    });

    it('should not add duplicate favorites', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('prompt-1');
        result.current.addFavorite('prompt-1');
      });

      expect(result.current.favorites).toEqual(['prompt-1']);
      expect(result.current.count).toBe(1);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a prompt from favorites', () => {
      localStorage.setItem('bizprompt_favorites', JSON.stringify(['prompt-1', 'prompt-2']));

      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.removeFavorite('prompt-1');
      });

      expect(result.current.favorites).toEqual(['prompt-2']);
      expect(result.current.count).toBe(1);
    });

    it('should do nothing when removing non-existent favorite', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('prompt-1');
        result.current.removeFavorite('prompt-2');
      });

      expect(result.current.favorites).toEqual(['prompt-1']);
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite if not present', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.toggleFavorite('prompt-1');
      });

      expect(result.current.favorites).toContain('prompt-1');
    });

    it('should remove favorite if already present', () => {
      localStorage.setItem('bizprompt_favorites', JSON.stringify(['prompt-1']));

      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.toggleFavorite('prompt-1');
      });

      expect(result.current.favorites).not.toContain('prompt-1');
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorited prompts', () => {
      localStorage.setItem('bizprompt_favorites', JSON.stringify(['prompt-1']));

      const { result } = renderHook(() => useFavorites());

      expect(result.current.isFavorite('prompt-1')).toBe(true);
    });

    it('should return false for non-favorited prompts', () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.isFavorite('prompt-1')).toBe(false);
    });
  });

  describe('clearAllFavorites', () => {
    it('should clear all favorites', () => {
      localStorage.setItem('bizprompt_favorites', JSON.stringify(['prompt-1', 'prompt-2', 'prompt-3']));

      const { result } = renderHook(() => useFavorites());

      expect(result.current.count).toBe(3);

      act(() => {
        result.current.clearAllFavorites();
      });

      expect(result.current.favorites).toEqual([]);
      expect(result.current.count).toBe(0);
    });
  });

  describe('localStorage persistence', () => {
    it('should save to localStorage when favorites change', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('prompt-1');
      });

      const saved = localStorage.getItem('bizprompt_favorites');
      expect(JSON.parse(saved!)).toEqual(['prompt-1']);
    });
  });
});
