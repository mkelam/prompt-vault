import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toBe('px-4 py-2');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('should handle falsy conditional classes', () => {
    const isActive = false;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class');
  });

  it('should merge conflicting Tailwind classes correctly', () => {
    const result = cn('px-4', 'px-2');
    expect(result).toBe('px-2');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['flex', 'items-center']);
    expect(result).toBe('flex items-center');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      'text-red-500': true,
      'text-blue-500': false,
      'font-bold': true,
    });
    expect(result).toBe('text-red-500 font-bold');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle null and undefined values', () => {
    const result = cn('base', null, undefined, 'end');
    expect(result).toBe('base end');
  });

  it('should handle complex nested conditions', () => {
    // Test primary variant
    let variant = 'primary';
    const size = 'lg';
    let result = cn(
      'btn',
      variant === 'primary' && 'bg-blue-500',
      variant === 'secondary' && 'bg-gray-500', 
      size === 'lg' ? 'px-6 py-3' : 'px-4 py-2'
    );
    expect(result).toBe('btn bg-blue-500 px-6 py-3');

    // Test secondary variant to validate the conditional logic
    variant = 'secondary';
    result = cn(
      'btn',
      variant === 'primary' && 'bg-blue-500',
      variant === 'secondary' && 'bg-gray-500',
      size === 'lg' ? 'px-6 py-3' : 'px-4 py-2'
    );
    expect(result).toBe('btn bg-gray-500 px-6 py-3');
  });
});
