import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptList } from '@/app/components/features/PromptList';
import { Prompt } from '@/lib/types';

const createMockPrompt = (overrides: Partial<Prompt> = {}): Prompt => ({
  id: 'prompt-1',
  title: 'SWOT Analysis',
  description: 'Strategic planning framework for competitive analysis',
  template: 'Analyze {{company}} using SWOT',
  category: 'strategy',
  tier: 'free',
  estimatedTimeSaved: '30 min',
  frameworks: ['SWOT', 'McKinsey'],
  variables: [{ name: 'company', example: 'Acme', description: 'Company name', required: true }],
  tags: ['strategy'],
  ...overrides,
});

const mockPrompts: Prompt[] = [
  createMockPrompt({ id: 'prompt-1', title: 'SWOT Analysis', tier: 'free' }),
  createMockPrompt({ id: 'prompt-2', title: 'Porter Five Forces', tier: 'free' }),
  createMockPrompt({ id: 'prompt-3', title: 'Premium BCG Matrix', tier: 'premium' }),
];

describe('PromptList', () => {
  const mockOnSelect = jest.fn();
  const mockOnUnlockClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('empty state', () => {
    it('should show empty message when no prompts', () => {
      render(
        <PromptList
          prompts={[]}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      expect(screen.getByText(/no prompts found matching your criteria/i)).toBeInTheDocument();
    });
  });

  describe('rendering prompts', () => {
    it('should render all prompts', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      expect(screen.getByText('SWOT Analysis')).toBeInTheDocument();
      expect(screen.getByText('Porter Five Forces')).toBeInTheDocument();
      expect(screen.getByText('Premium BCG Matrix')).toBeInTheDocument();
    });

    it('should render category badge for each prompt', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const categoryBadges = screen.getAllByText('strategy');
      expect(categoryBadges).toHaveLength(3);
    });

    it('should render estimated time saved', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const timeBadges = screen.getAllByText('30 min');
      expect(timeBadges).toHaveLength(3);
    });

    it('should have proper list ARIA role', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      expect(screen.getByRole('list', { name: /prompt templates/i })).toBeInTheDocument();
    });

    it('should have listitem role for each prompt', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });
  });

  describe('free prompts', () => {
    it('should call onSelect when free prompt clicked', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const swotCard = screen.getByText('SWOT Analysis').closest('[role="listitem"]');
      fireEvent.click(swotCard!);

      expect(mockOnSelect).toHaveBeenCalledWith(mockPrompts[0]);
      expect(mockOnUnlockClick).not.toHaveBeenCalled();
    });

    it('should show description for free prompts', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      expect(screen.getAllByText(/strategic planning framework/i)).toHaveLength(2);
    });

    it('should show frameworks for free prompts', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const swotTags = screen.getAllByText('SWOT');
      expect(swotTags.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('premium prompts (locked)', () => {
    it('should show lock badge for premium prompts when not unlocked', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      expect(screen.getByText('PREMIUM')).toBeInTheDocument();
    });

    it('should call onUnlockClick when premium prompt clicked while locked', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const premiumCard = screen.getByText('Premium BCG Matrix').closest('[role="listitem"]');
      fireEvent.click(premiumCard!);

      expect(mockOnUnlockClick).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should show unlock prompt instead of description for locked premium', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      expect(screen.getByText(/unlock premium to access this enterprise-grade prompt/i)).toBeInTheDocument();
    });

    it('should show click to unlock text for locked premium', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      expect(screen.getByText(/click to unlock premium access/i)).toBeInTheDocument();
    });
  });

  describe('premium prompts (unlocked)', () => {
    it('should call onSelect when premium prompt clicked while unlocked', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={true}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const premiumCard = screen.getByText('Premium BCG Matrix').closest('[role="listitem"]');
      fireEvent.click(premiumCard!);

      expect(mockOnSelect).toHaveBeenCalledWith(mockPrompts[2]);
      expect(mockOnUnlockClick).not.toHaveBeenCalled();
    });

    it('should show crown badge for unlocked premium prompts', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={true}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      // Should show PREMIUM text (but with crown icon, not lock)
      expect(screen.getByText('PREMIUM')).toBeInTheDocument();
    });

    it('should show description for unlocked premium prompts', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={true}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      // All 3 prompts should show their real descriptions
      const descriptions = screen.getAllByText(/strategic planning framework/i);
      expect(descriptions).toHaveLength(3);
    });
  });

  describe('favorites', () => {
    it('should show heart icon for favorited prompts', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={['prompt-1']}
        />
      );

      const swotCard = screen.getByText('SWOT Analysis').closest('[role="listitem"]');
      const heartIndicator = swotCard?.querySelector('.text-pink-400');
      expect(heartIndicator).toBeInTheDocument();
    });

    it('should not show heart for non-favorited prompts', () => {
      render(
        <PromptList
          prompts={[mockPrompts[0]]}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const swotCard = screen.getByText('SWOT Analysis').closest('[role="listitem"]');
      const heartIndicator = swotCard?.querySelector('.text-pink-400.fill-pink-400');
      expect(heartIndicator).not.toBeInTheDocument();
    });

    it('should not show heart for locked premium prompts even if favorited', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={['prompt-3']}
        />
      );

      const premiumCard = screen.getByText('Premium BCG Matrix').closest('[role="listitem"]');
      const heartIndicator = premiumCard?.querySelector('.fill-pink-400');
      expect(heartIndicator).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('should be focusable with tab', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const listItems = screen.getAllByRole('listitem');
      expect(listItems[0]).toHaveAttribute('tabindex', '0');
    });

    it('should trigger click on Enter key', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const swotCard = screen.getByText('SWOT Analysis').closest('[role="listitem"]');
      fireEvent.keyDown(swotCard!, { key: 'Enter' });

      expect(mockOnSelect).toHaveBeenCalledWith(mockPrompts[0]);
    });

    it('should trigger click on Space key', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const swotCard = screen.getByText('SWOT Analysis').closest('[role="listitem"]');
      fireEvent.keyDown(swotCard!, { key: ' ' });

      expect(mockOnSelect).toHaveBeenCalledWith(mockPrompts[0]);
    });

    it('should have focus styles', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const listItems = screen.getAllByRole('listitem');
      expect(listItems[0]).toHaveClass('focus:ring-2');
    });
  });

  describe('accessibility', () => {
    it('should have appropriate aria-label for each prompt card', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={['prompt-1']}
        />
      );

      const swotCard = screen.getByText('SWOT Analysis').closest('[role="listitem"]');
      expect(swotCard).toHaveAttribute('aria-label', expect.stringContaining('SWOT Analysis'));
      expect(swotCard).toHaveAttribute('aria-label', expect.stringContaining('Favorited'));
    });

    it('should indicate locked status in aria-label for premium prompts', () => {
      render(
        <PromptList
          prompts={mockPrompts}
          onSelect={mockOnSelect}
          isUnlocked={false}
          onUnlockClick={mockOnUnlockClick}
          favorites={[]}
        />
      );

      const premiumCard = screen.getByText('Premium BCG Matrix').closest('[role="listitem"]');
      expect(premiumCard).toHaveAttribute('aria-label', expect.stringContaining('Premium locked'));
    });
  });
});
