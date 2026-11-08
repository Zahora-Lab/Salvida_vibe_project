import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import BaseInput from './BaseInput';

describe('BaseInput', () => {
  it('renders a text input with the outlined variant by default', () => {
    render(<BaseInput placeholder="name" />);
    const el = screen.getByPlaceholderText('name');
    expect(el).toHaveAttribute('type', 'text');
    expect(el).toHaveClass('input', 'input--outlined');
  });

  it.each(['email', 'tel', 'number', 'url'])('forwards type="%s"', (type) => {
    render(<BaseInput type={type} placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveAttribute('type', type);
  });

  it('appends a custom className without dropping the base classes', () => {
    render(<BaseInput className="custom" placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveClass('input', 'input--outlined', 'custom');
  });

  it.each(['outlined', 'filled', 'filled-bordered', 'compact'] as const)('applies variant="%s"', (variant) => {
    render(<BaseInput variant={variant} placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveClass(`input--${variant}`);
  });

  it('combines variant, size and status classes', () => {
    render(<BaseInput variant="filled" size="md" status="error" placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveClass(
      'input',
      'input--filled',
      'input--md',
      'input--error',
    );
  });

  it('uses the lg size by default', () => {
    render(<BaseInput placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveClass('input--lg');
  });

  it.each(['lg', 'md', 'sm', 'xs'] as const)('applies size="%s"', (size) => {
    render(<BaseInput size={size} placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveClass(`input--${size}`);
  });

  it('marks the error status and exposes aria-invalid', () => {
    render(<BaseInput status="error" placeholder="x" />);
    const el = screen.getByPlaceholderText('x');
    expect(el).toHaveClass('input--error');
    expect(el).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no error class nor aria-invalid by default', () => {
    render(<BaseInput placeholder="x" />);
    const el = screen.getByPlaceholderText('x');
    expect(el).not.toHaveClass('input--error');
    expect(el).not.toHaveAttribute('aria-invalid');
  });

  it('forwards native props and events', () => {
    const onChange = vi.fn();
    render(<BaseInput placeholder="x" required disabled={false} onChange={onChange} />);
    const el = screen.getByPlaceholderText('x');
    expect(el).toBeRequired();
    fireEvent.change(el, { target: { value: 'hi' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('forwards the ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<BaseInput ref={ref} placeholder="x" />);
    expect(ref.current).toBe(screen.getByPlaceholderText('x'));
  });
});
