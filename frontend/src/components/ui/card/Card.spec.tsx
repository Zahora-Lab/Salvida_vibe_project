import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './index';

describe('Card', () => {
  it('renders a plain div surface by default', () => {
    render(<Card data-testid="c">x</Card>);
    const el = screen.getByTestId('c');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('card');
    expect(el).not.toHaveClass('card--padded', 'card--clip');
  });

  it('renders the element given in `as`', () => {
    render(
      <ul>
        <Card as="li" data-testid="c">x</Card>
      </ul>,
    );
    expect(screen.getByTestId('c').tagName).toBe('LI');
  });

  it('adds padding and clipping only when asked', () => {
    render(<Card data-testid="c" padding="md" clip>x</Card>);
    expect(screen.getByTestId('c')).toHaveClass('card--padded', 'card--clip');
  });

  it('merges className', () => {
    render(<Card data-testid="c" className="mine">x</Card>);
    expect(screen.getByTestId('c')).toHaveClass('card', 'mine');
  });
});
