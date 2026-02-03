import React from 'react';
import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/app/components/ui/GlassCard';

describe('GlassCard', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(
        <GlassCard>
          <p>Card content</p>
        </GlassCard>
      );

      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <GlassCard>
          <h2>Title</h2>
          <p>Description</p>
          <button>Action</button>
        </GlassCard>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('default styling', () => {
    it('should have glass-card base class', () => {
      render(
        <GlassCard data-testid="card">
          Content
        </GlassCard>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('glass-card');
    });

    it('should have border classes', () => {
      render(
        <GlassCard data-testid="card">
          Content
        </GlassCard>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('border-white/10');
      expect(card).toHaveClass('hover:border-white/20');
    });
  });

  describe('active state', () => {
    it('should apply active styles when active prop is true', () => {
      render(
        <GlassCard active data-testid="card">
          Active Card
        </GlassCard>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-white/10');
      expect(card).toHaveClass('border-white/30');
      expect(card).toHaveClass('ring-1');
      expect(card).toHaveClass('ring-white/30');
    });

    it('should not apply active styles when active prop is false', () => {
      render(
        <GlassCard active={false} data-testid="card">
          Inactive Card
        </GlassCard>
      );

      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('ring-1');
    });

    it('should not apply active styles when active prop is undefined', () => {
      render(
        <GlassCard data-testid="card">
          Default Card
        </GlassCard>
      );

      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('ring-1');
    });
  });

  describe('custom className', () => {
    it('should merge custom className with default classes', () => {
      render(
        <GlassCard className="custom-class max-w-md" data-testid="card">
          Content
        </GlassCard>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('max-w-md');
      expect(card).toHaveClass('glass-card');
    });
  });

  describe('HTML attributes', () => {
    it('should pass through data attributes', () => {
      render(
        <GlassCard data-testid="card" data-custom="value">
          Content
        </GlassCard>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('data-custom', 'value');
    });

    it('should support onClick handler', () => {
      const handleClick = jest.fn();
      render(
        <GlassCard onClick={handleClick} data-testid="card">
          Clickable Card
        </GlassCard>
      );

      const card = screen.getByTestId('card');
      card.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should support role attribute for accessibility', () => {
      render(
        <GlassCard role="article" data-testid="card">
          Article Content
        </GlassCard>
      );

      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });
});
