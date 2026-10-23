import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './index';

describe('EmptyState', () => {
  it('shows the message at the default size', () => {
    render(<EmptyState>Sin resultados</EmptyState>);
    expect(screen.getByText('Sin resultados').parentElement).toHaveClass('empty-state', 'empty-state--md');
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size="%s"', (size) => {
    render(<EmptyState size={size}>x</EmptyState>);
    expect(screen.getByText('x').parentElement).toHaveClass(`empty-state--${size}`);
  });

  it('draws the card only when bordered', () => {
    const { rerender } = render(<EmptyState>x</EmptyState>);
    expect(screen.getByText('x').parentElement).not.toHaveClass('empty-state--bordered');
    rerender(<EmptyState bordered>x</EmptyState>);
    expect(screen.getByText('x').parentElement).toHaveClass('empty-state--bordered');
  });

  it('renders the icon before the message', () => {
    render(<EmptyState icon={<svg data-testid="icon" />}>x</EmptyState>);
    expect(screen.getByText('x').parentElement?.firstElementChild).toBe(screen.getByTestId('icon'));
  });
});
