import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Chip } from './index';

describe('Chip', () => {
  it('is an unselected outlined md chip by default and never submits a form', () => {
    render(<Chip>Todos</Chip>);
    const el = screen.getByRole('button', { name: 'Todos' });
    expect(el).toHaveClass('chip', 'chip--outlined', 'chip--md');
    expect(el).not.toHaveClass('chip--selected');
    expect(el).toHaveAttribute('aria-pressed', 'false');
    expect(el).toHaveAttribute('type', 'button');
  });

  it.each(['filled', 'outlined', 'tinted'] as const)('applies variant="%s"', (variant) => {
    render(<Chip variant={variant}>x</Chip>);
    expect(screen.getByRole('button')).toHaveClass(`chip--${variant}`);
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size="%s"', (size) => {
    render(<Chip size={size}>x</Chip>);
    expect(screen.getByRole('button')).toHaveClass(`chip--${size}`);
  });

  it('marks the selected chip and exposes aria-pressed', () => {
    render(<Chip selected>x</Chip>);
    const el = screen.getByRole('button');
    expect(el).toHaveClass('chip--selected');
    expect(el).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onClick and merges className', () => {
    const onClick = vi.fn();
    render(<Chip className="mine" onClick={onClick}>x</Chip>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toHaveClass('chip', 'mine');
  });
});
