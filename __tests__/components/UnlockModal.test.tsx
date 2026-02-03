import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnlockModal } from '@/app/components/features/UnlockModal';

describe('UnlockModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUnlock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render unlock modal with title', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      expect(screen.getByText('Unlock Premium Prompts')).toBeInTheDocument();
    });

    it('should render description text', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      expect(
        screen.getByText(/enter your license key to access 50\+ premium enterprise prompts/i)
      ).toBeInTheDocument();
    });

    it('should render license key input', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      expect(screen.getByPlaceholderText('BIZPROMPT-XXXX-XXXX')).toBeInTheDocument();
    });

    it('should render unlock button', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      expect(screen.getByRole('button', { name: /unlock premium/i })).toBeInTheDocument();
    });

    it('should render purchase link', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      expect(screen.getByText(/don't have a license key/i)).toBeInTheDocument();
      expect(screen.getByText('Get Premium Access')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'unlock-modal-title');
    });
  });

  describe('input behavior', () => {
    it('should update input value when typing', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const input = screen.getByPlaceholderText('BIZPROMPT-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'TEST-KEY' } });

      expect(input).toHaveValue('TEST-KEY');
    });

    it('should disable submit button when input is empty', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const submitButton = screen.getByRole('button', { name: /unlock premium/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when input has value', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const input = screen.getByPlaceholderText('BIZPROMPT-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'SOME-KEY' } });

      const submitButton = screen.getByRole('button', { name: /unlock premium/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should clear error when typing after error', () => {
      mockOnUnlock.mockReturnValue(false);
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      // Enter invalid key
      const input = screen.getByPlaceholderText('BIZPROMPT-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'INVALID' } });
      fireEvent.submit(screen.getByRole('button', { name: /unlock premium/i }).closest('form')!);

      // Wait for validation
      jest.advanceTimersByTime(1000);

      // Error should be shown (after timer)
      // Now type again
      fireEvent.change(input, { target: { value: 'NEW-VALUE' } });

      // Error should be cleared
      expect(screen.queryByText(/invalid license key/i)).not.toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should show loading state when validating', async () => {
      mockOnUnlock.mockReturnValue(true);
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const input = screen.getByPlaceholderText('BIZPROMPT-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'VALID-KEY' } });

      const form = screen.getByRole('button', { name: /unlock premium/i }).closest('form')!;
      fireEvent.submit(form);

      expect(screen.getByText('Validating...')).toBeInTheDocument();
    });

    it('should call onUnlock with entered key', async () => {
      mockOnUnlock.mockReturnValue(true);
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const input = screen.getByPlaceholderText('BIZPROMPT-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'BIZPROMPT-PRO-2024' } });

      const form = screen.getByRole('button', { name: /unlock premium/i }).closest('form')!;
      fireEvent.submit(form);

      // Advance timer for validation delay
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockOnUnlock).toHaveBeenCalledWith('BIZPROMPT-PRO-2024');
      });
    });

    it('should show success state when unlock succeeds', async () => {
      mockOnUnlock.mockReturnValue(true);
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const input = screen.getByPlaceholderText('BIZPROMPT-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'VALID-KEY' } });

      const form = screen.getByRole('button', { name: /unlock premium/i }).closest('form')!;
      fireEvent.submit(form);

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Premium Unlocked!')).toBeInTheDocument();
        expect(screen.getByText('You now have access to all premium prompts.')).toBeInTheDocument();
      });
    });

    it('should close modal after successful unlock', async () => {
      mockOnUnlock.mockReturnValue(true);
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const input = screen.getByPlaceholderText('BIZPROMPT-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'VALID-KEY' } });

      const form = screen.getByRole('button', { name: /unlock premium/i }).closest('form')!;
      fireEvent.submit(form);

      // Advance for validation delay (800ms in component)
      await jest.advanceTimersByTimeAsync(800);

      // Advance for auto-close delay (1500ms in component)
      await jest.advanceTimersByTimeAsync(1500);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should show error when unlock fails', async () => {
      mockOnUnlock.mockReturnValue(false);
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const input = screen.getByPlaceholderText('BIZPROMPT-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'INVALID-KEY' } });

      const form = screen.getByRole('button', { name: /unlock premium/i }).closest('form')!;
      fireEvent.submit(form);

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText(/invalid license key/i)).toBeInTheDocument();
      });
    });

    it('should not close modal when unlock fails', async () => {
      mockOnUnlock.mockReturnValue(false);
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const input = screen.getByPlaceholderText('BIZPROMPT-XXXX-XXXX');
      fireEvent.change(input, { target: { value: 'INVALID-KEY' } });

      const form = screen.getByRole('button', { name: /unlock premium/i }).closest('form')!;
      fireEvent.submit(form);

      jest.advanceTimersByTime(3000);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('close functionality', () => {
    it('should call onClose when close button clicked', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop clicked', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      // The dialog element itself is the backdrop with onClick={onClose}
      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key pressed', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when modal content clicked', () => {
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const modalTitle = screen.getByText('Unlock Premium Prompts');
      fireEvent.click(modalTitle);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('purchase link', () => {
    it('should show alert when purchase link clicked', () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation();
      render(<UnlockModal onClose={mockOnClose} onUnlock={mockOnUnlock} />);

      const purchaseLink = screen.getByText('Get Premium Access');
      fireEvent.click(purchaseLink);

      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('BIZPROMPT-PRO-2024')
      );

      alertMock.mockRestore();
    });
  });
});
