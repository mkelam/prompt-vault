import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromptModal } from '@/app/components/features/PromptModal';
import { Prompt } from '@/lib/types';

// Mock analytics hook
const mockTrackPromptCopy = jest.fn();
const mockTrackPromptExport = jest.fn();

jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackPromptCopy: mockTrackPromptCopy,
    trackPromptExport: mockTrackPromptExport,
  }),
}));

// Mock export functions
const mockExportToExcel = jest.fn();
const mockExportToMarkdown = jest.fn();

jest.mock('@/lib/export', () => ({
  exportToExcel: (...args: unknown[]) => mockExportToExcel(...args),
  exportToMarkdown: (...args: unknown[]) => mockExportToMarkdown(...args),
}));

// Mock clipboard
const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

const mockPrompt: Prompt = {
  id: 'test-prompt-1',
  title: 'SWOT Analysis Template',
  description: 'Comprehensive strategic analysis framework',
  template: 'Analyze {{company_name}} in the {{industry}} industry using SWOT framework.',
  category: 'strategy',
  tier: 'free',
  estimatedTimeSaved: '30 min',
  frameworks: ['SWOT', 'Strategic Planning'],
  variables: [
    { name: 'company_name', example: 'Acme Corp', description: 'Target company name', required: true },
    { name: 'industry', example: 'Technology', description: 'Industry sector', required: false },
  ],
  tags: ['strategy', 'analysis'],
};

const premiumPrompt: Prompt = {
  ...mockPrompt,
  id: 'premium-1',
  tier: 'premium',
  title: 'Premium BCG Matrix',
};

describe('PromptModal', () => {
  const mockOnClose = jest.fn();
  const mockOnToggleFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render prompt title and description', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      expect(screen.getByText('SWOT Analysis Template')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive strategic analysis framework')).toBeInTheDocument();
    });

    it('should render category badge', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      expect(screen.getByText('strategy')).toBeInTheDocument();
    });

    it('should render premium badge for premium prompts', () => {
      render(
        <PromptModal
          prompt={premiumPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      expect(screen.getByText('PREMIUM')).toBeInTheDocument();
    });

    it('should render estimated time saved', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      expect(screen.getByText('30 min saved')).toBeInTheDocument();
    });

    it('should render frameworks', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      expect(screen.getByText('SWOT')).toBeInTheDocument();
      expect(screen.getByText('Strategic Planning')).toBeInTheDocument();
    });

    it('should render variable inputs', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      expect(screen.getByPlaceholderText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Technology')).toBeInTheDocument();
    });

    it('should show required indicator for required variables', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      expect(screen.getByText('*Required')).toBeInTheDocument();
    });
  });

  describe('variable substitution', () => {
    it('should update preview when variables are entered', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const companyInput = screen.getByPlaceholderText('Acme Corp');
      fireEvent.change(companyInput, { target: { value: 'Tesla' } });

      expect(screen.getByText((content) => content.includes('Tesla'))).toBeInTheDocument();
    });

    it('should show unfilled placeholders in preview', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      // Unfilled variables show as {{variable_name}}
      expect(screen.getByText('{{company_name}}')).toBeInTheDocument();
    });
  });

  describe('copy functionality', () => {
    it('should copy filled template to clipboard', async () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const companyInput = screen.getByPlaceholderText('Acme Corp');
      fireEvent.change(companyInput, { target: { value: 'Tesla' } });

      const copyButton = screen.getByRole('button', { name: /copy prompt/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          expect.stringContaining('Tesla')
        );
      });
    });

    it('should track copy event in analytics', async () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const copyButton = screen.getByRole('button', { name: /copy prompt/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockTrackPromptCopy).toHaveBeenCalledWith(
          'test-prompt-1',
          'SWOT Analysis Template'
        );
      });
    });

    it('should show copied confirmation', async () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const copyButton = screen.getByRole('button', { name: /copy prompt/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });
  });

  describe('export functionality', () => {
    it('should export to Excel and track analytics', async () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const excelButton = screen.getByRole('button', { name: /excel/i });
      fireEvent.click(excelButton);

      // Advance timer for simulated delay
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockExportToExcel).toHaveBeenCalled();
        expect(mockTrackPromptExport).toHaveBeenCalledWith(
          'test-prompt-1',
          'SWOT Analysis Template',
          'excel'
        );
      });
    });

    it('should export to Markdown and track analytics', async () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const markdownButton = screen.getByRole('button', { name: /markdown/i });
      fireEvent.click(markdownButton);

      // Advance timer for simulated delay
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockExportToMarkdown).toHaveBeenCalled();
        expect(mockTrackPromptExport).toHaveBeenCalledWith(
          'test-prompt-1',
          'SWOT Analysis Template',
          'markdown'
        );
      });
    });

    it('should show loading state during export', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const excelButton = screen.getByRole('button', { name: /excel/i });
      fireEvent.click(excelButton);

      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });
  });

  describe('favorite functionality', () => {
    it('should show filled heart when favorited', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={true}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const favoriteButton = screen.getByRole('button', { name: /remove from favorites/i });
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should show empty heart when not favorited', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should call onToggleFavorite when favorite button clicked', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      fireEvent.click(favoriteButton);

      expect(mockOnToggleFavorite).toHaveBeenCalledTimes(1);
    });
  });

  describe('close functionality', () => {
    it('should call onClose when close button clicked', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key pressed', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have accessible variable inputs', () => {
      render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const companyInput = screen.getByPlaceholderText('Acme Corp');
      expect(companyInput).toHaveAttribute('aria-describedby');
    });
  });

  describe('state reset on prompt change', () => {
    it('should reset variables when prompt changes', () => {
      const { rerender } = render(
        <PromptModal
          prompt={mockPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const companyInput = screen.getByPlaceholderText('Acme Corp');
      fireEvent.change(companyInput, { target: { value: 'Tesla' } });

      // Change to different prompt
      rerender(
        <PromptModal
          prompt={premiumPrompt}
          onClose={mockOnClose}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      // Input should be empty again
      const newCompanyInput = screen.getByPlaceholderText('Acme Corp');
      expect(newCompanyInput).toHaveValue('');
    });
  });
});
