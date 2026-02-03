import { renderHook, act } from '@testing-library/react';
import { useAnalytics } from '@/hooks/useAnalytics';

describe('useAnalytics', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('track function', () => {
    it('should save events to localStorage queue', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.track({ type: 'page_view', page: '/home' });
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('page_view');
      expect(events[0].page).toBe('/home');
    });

    it('should not track when disabled', () => {
      const { result } = renderHook(() => useAnalytics({ enabled: false }));

      act(() => {
        result.current.track({ type: 'page_view', page: '/home' });
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      expect(queue).toBeNull();
    });

    it('should log to console in debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { result } = renderHook(() => useAnalytics({ debug: true }));

      act(() => {
        result.current.track({ type: 'page_view', page: '/test' });
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics]',
        'page_view',
        expect.objectContaining({ type: 'page_view', page: '/test' })
      );

      consoleSpy.mockRestore();
    });

    it('should limit queue to 100 events', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        for (let i = 0; i < 150; i++) {
          result.current.track({ type: 'page_view', page: `/page-${i}` });
        }
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events).toHaveLength(100);
      // Should keep most recent events
      expect(events[0].page).toBe('/page-50');
      expect(events[99].page).toBe('/page-149');
    });
  });

  describe('trackPromptView', () => {
    it('should track prompt view with all parameters', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPromptView('prompt-1', 'SWOT Analysis', 'strategy', 'free');
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0]).toEqual({
        type: 'prompt_view',
        promptId: 'prompt-1',
        promptTitle: 'SWOT Analysis',
        category: 'strategy',
        tier: 'free',
      });
    });

    it('should track premium tier correctly', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPromptView('prompt-2', 'BCG Matrix', 'strategy', 'premium');
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0].tier).toBe('premium');
    });
  });

  describe('trackPromptCopy', () => {
    it('should track prompt copy event', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPromptCopy('prompt-1', 'SWOT Analysis');
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0]).toEqual({
        type: 'prompt_copy',
        promptId: 'prompt-1',
        promptTitle: 'SWOT Analysis',
      });
    });
  });

  describe('trackPromptExport', () => {
    it('should track Excel export', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPromptExport('prompt-1', 'SWOT Analysis', 'excel');
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0]).toEqual({
        type: 'prompt_export',
        promptId: 'prompt-1',
        promptTitle: 'SWOT Analysis',
        format: 'excel',
      });
    });

    it('should track Markdown export', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPromptExport('prompt-1', 'SWOT Analysis', 'markdown');
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0].format).toBe('markdown');
    });
  });

  describe('trackSearch', () => {
    it('should track search query and results count', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackSearch('SWOT', 5);
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0]).toEqual({
        type: 'search',
        query: 'SWOT',
        resultsCount: 5,
      });
    });
  });

  describe('trackCategoryFilter', () => {
    it('should track category filter', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackCategoryFilter('strategy');
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0]).toEqual({
        type: 'category_filter',
        category: 'strategy',
      });
    });
  });

  describe('trackPremiumUnlock', () => {
    it('should track successful unlock attempt', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPremiumUnlock(true);
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0]).toEqual({
        type: 'premium_unlock_attempt',
        success: true,
      });
    });

    it('should track failed unlock attempt', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPremiumUnlock(false);
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0].success).toBe(false);
    });
  });

  describe('trackFavoriteToggle', () => {
    it('should track add favorite action', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackFavoriteToggle('prompt-1', 'add');
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0]).toEqual({
        type: 'favorite_toggle',
        promptId: 'prompt-1',
        action: 'add',
      });
    });

    it('should track remove favorite action', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackFavoriteToggle('prompt-1', 'remove');
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0].action).toBe('remove');
    });
  });

  describe('trackFilterModeChange', () => {
    it('should track filter mode changes', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackFilterModeChange('favorites');
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events[0]).toEqual({
        type: 'filter_mode_change',
        mode: 'favorites',
      });
    });

    it('should track all filter modes', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackFilterModeChange('all');
        result.current.trackFilterModeChange('favorites');
        result.current.trackFilterModeChange('recent');
      });

      const queue = localStorage.getItem('bizprompt_analytics_queue');
      const events = JSON.parse(queue!);
      expect(events.map((e: { mode: string }) => e.mode)).toEqual(['all', 'favorites', 'recent']);
    });
  });

  describe('getAnalyticsSummary', () => {
    it('should return correct summary of events', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPromptView('p1', 'Title1', 'cat', 'free');
        result.current.trackPromptView('p2', 'Title2', 'cat', 'free');
        result.current.trackPromptCopy('p1', 'Title1');
        result.current.trackPromptExport('p1', 'Title1', 'excel');
        result.current.trackSearch('query', 5);
        result.current.trackSearch('another', 10);
      });

      const summary = result.current.getAnalyticsSummary();

      expect(summary).toEqual({
        totalEvents: 6,
        promptViews: 2,
        searches: 2,
        exports: 1,
        copies: 1,
      });
    });

    it('should return zeros when no events', () => {
      const { result } = renderHook(() => useAnalytics());

      const summary = result.current.getAnalyticsSummary();

      expect(summary).toEqual({
        totalEvents: 0,
        promptViews: 0,
        searches: 0,
        exports: 0,
        copies: 0,
      });
    });
  });

  describe('localStorage error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const { result } = renderHook(() => useAnalytics());

      // Should not throw
      expect(() => {
        act(() => {
          result.current.track({ type: 'page_view', page: '/test' });
        });
      }).not.toThrow();

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
