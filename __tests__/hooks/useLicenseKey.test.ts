import { renderHook, act } from '@testing-library/react';
import { useLicenseKey } from '@/hooks/useLicenseKey';

describe('useLicenseKey', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with isUnlocked as false', () => {
      const { result } = renderHook(() => useLicenseKey());

      expect(result.current.isUnlocked).toBe(false);
    });

    it('should start with isLoading as true, then false after mount', async () => {
      const { result } = renderHook(() => useLicenseKey());

      // After useEffect runs, isLoading should be false
      expect(result.current.isLoading).toBe(false);
    });

    it('should load unlock state from localStorage if previously unlocked', () => {
      localStorage.setItem('bizprompt_license_unlocked', 'true');

      const { result } = renderHook(() => useLicenseKey());

      expect(result.current.isUnlocked).toBe(true);
    });
  });

  describe('validateKey', () => {
    it('should return true for valid license key BIZPROMPT-PRO-2024', () => {
      const { result } = renderHook(() => useLicenseKey());

      expect(result.current.validateKey('BIZPROMPT-PRO-2024')).toBe(true);
    });

    it('should return true for valid license key BIZPROMPT-PREMIUM-VIP', () => {
      const { result } = renderHook(() => useLicenseKey());

      expect(result.current.validateKey('BIZPROMPT-PREMIUM-VIP')).toBe(true);
    });

    it('should return true for valid license key ENTERPRISE-UNLOCK-KEY', () => {
      const { result } = renderHook(() => useLicenseKey());

      expect(result.current.validateKey('ENTERPRISE-UNLOCK-KEY')).toBe(true);
    });

    it('should be case insensitive', () => {
      const { result } = renderHook(() => useLicenseKey());

      expect(result.current.validateKey('bizprompt-pro-2024')).toBe(true);
      expect(result.current.validateKey('BizPrompt-Pro-2024')).toBe(true);
    });

    it('should handle whitespace in keys', () => {
      const { result } = renderHook(() => useLicenseKey());

      expect(result.current.validateKey('  BIZPROMPT-PRO-2024  ')).toBe(true);
    });

    it('should return false for invalid license key', () => {
      const { result } = renderHook(() => useLicenseKey());

      expect(result.current.validateKey('INVALID-KEY')).toBe(false);
      expect(result.current.validateKey('')).toBe(false);
      expect(result.current.validateKey('random-string')).toBe(false);
    });
  });

  describe('unlock', () => {
    it('should unlock with valid key and persist to localStorage', () => {
      const { result } = renderHook(() => useLicenseKey());

      let success: boolean;
      act(() => {
        success = result.current.unlock('BIZPROMPT-PRO-2024');
      });

      expect(success!).toBe(true);
      expect(result.current.isUnlocked).toBe(true);
      expect(localStorage.getItem('bizprompt_license_unlocked')).toBe('true');
    });

    it('should not unlock with invalid key', () => {
      const { result } = renderHook(() => useLicenseKey());

      let success: boolean;
      act(() => {
        success = result.current.unlock('INVALID-KEY');
      });

      expect(success!).toBe(false);
      expect(result.current.isUnlocked).toBe(false);
      expect(localStorage.getItem('bizprompt_license_unlocked')).toBeNull();
    });
  });

  describe('lock', () => {
    it('should lock and remove from localStorage', () => {
      localStorage.setItem('bizprompt_license_unlocked', 'true');
      const { result } = renderHook(() => useLicenseKey());

      expect(result.current.isUnlocked).toBe(true);

      act(() => {
        result.current.lock();
      });

      expect(result.current.isUnlocked).toBe(false);
      expect(localStorage.getItem('bizprompt_license_unlocked')).toBeNull();
    });
  });
});
