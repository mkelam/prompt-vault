import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlassButton } from '@/app/components/ui/GlassButton';

describe('GlassButton', () => {
  describe('rendering', () => {
    it('should render button with children', () => {
      render(<GlassButton>Click me</GlassButton>);

      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('should render with default variant and size', () => {
      render(<GlassButton>Test</GlassButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white/10'); // primary variant
      expect(button).toHaveClass('text-base'); // md size
    });
  });

  describe('variants', () => {
    it('should apply primary variant styles', () => {
      render(<GlassButton variant="primary">Primary</GlassButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white/10');
      expect(button).toHaveClass('hover:bg-white/20');
      expect(button).toHaveClass('text-white');
    });

    it('should apply secondary variant styles', () => {
      render(<GlassButton variant="secondary">Secondary</GlassButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-black/20');
      expect(button).toHaveClass('text-white/80');
    });

    it('should apply danger variant styles', () => {
      render(<GlassButton variant="danger">Danger</GlassButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500/20');
      expect(button).toHaveClass('text-red-200');
    });
  });

  describe('sizes', () => {
    it('should apply small size styles', () => {
      render(<GlassButton size="sm">Small</GlassButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
    });

    it('should apply medium size styles', () => {
      render(<GlassButton size="md">Medium</GlassButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-base');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });

    it('should apply large size styles', () => {
      render(<GlassButton size="lg">Large</GlassButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-lg');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<GlassButton onClick={handleClick}>Click me</GlassButton>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <GlassButton onClick={handleClick} disabled>
          Disabled
        </GlassButton>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should apply disabled styles when disabled', () => {
      render(<GlassButton disabled>Disabled</GlassButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have focus styles for keyboard navigation', () => {
      render(<GlassButton>Accessible</GlassButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-blue-400/50');
    });

    it('should pass through aria attributes', () => {
      render(
        <GlassButton aria-label="Custom label" aria-pressed={true}>
          Test
        </GlassButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should support type attribute', () => {
      render(<GlassButton type="submit">Submit</GlassButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('custom className', () => {
    it('should merge custom className with default classes', () => {
      render(<GlassButton className="custom-class">Test</GlassButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('glass-btn'); // Still has default class
    });
  });
});
