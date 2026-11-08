import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PasswordInput } from '../../index';

describe('PasswordInput', () => {
  it('hides the password by default', () => {
    render(<PasswordInput placeholder="pwd" />);
    expect(screen.getByPlaceholderText('pwd')).toHaveAttribute('type', 'password');
  });

  it('toggles visibility and the accessible label', () => {
    render(<PasswordInput placeholder="pwd" showLabel="Show" hideLabel="Hide" />);
    const input = screen.getByPlaceholderText('pwd');

    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('does not submit a surrounding form when toggling', () => {
    render(<PasswordInput placeholder="pwd" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('merges a custom className on the input', () => {
    render(<PasswordInput placeholder="pwd" className="custom" />);
    expect(screen.getByPlaceholderText('pwd')).toHaveClass('input', 'password-input__field', 'custom');
  });
});
