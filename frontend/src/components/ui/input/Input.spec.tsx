import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './index';

describe('Input (dispatcher)', () => {
  it('renders a plain text input by default', () => {
    render(<Input placeholder="x" />);
    const el = screen.getByPlaceholderText('x');
    expect(el).toHaveAttribute('type', 'text');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each(['email', 'tel', 'number', 'url'] as const)('renders type="%s" as a plain input', (type) => {
    render(<Input type={type} placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveAttribute('type', type);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the password variant (with toggle) for type="password"', () => {
    render(<Input type="password" placeholder="x" showLabel="Show" />);
    expect(screen.getByPlaceholderText('x')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Show' })).toBeInTheDocument();
  });

  it('passes size and status through to the password variant', () => {
    render(<Input type="password" size="sm" status="error" placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveClass('input--sm', 'input--error');
  });

  it('forwards the ref for both plain and password inputs', () => {
    const plain = createRef<HTMLInputElement>();
    const pwd = createRef<HTMLInputElement>();
    render(
      <>
        <Input ref={plain} placeholder="plain" />
        <Input ref={pwd} type="password" placeholder="pwd" />
      </>,
    );
    expect(plain.current).toBe(screen.getByPlaceholderText('plain'));
    expect(pwd.current).toBe(screen.getByPlaceholderText('pwd'));
  });
});
