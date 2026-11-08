import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './index';

describe('Badge', () => {
  it('renders a neutral sm uppercase badge by default', () => {
    render(<Badge>Activo</Badge>);
    const el = screen.getByText('Activo');
    expect(el).toHaveClass('badge', 'badge--neutral', 'badge--sm', 'badge--uppercase');
  });

  it.each(['success', 'warning', 'danger', 'info', 'neutral', 'primary'] as const)(
    'applies tone="%s"',
    (tone) => {
      render(<Badge tone={tone}>x</Badge>);
      expect(screen.getByText('x')).toHaveClass(`badge--${tone}`);
    },
  );

  it.each(['sm', 'md'] as const)('applies size="%s"', (size) => {
    render(<Badge size={size}>x</Badge>);
    expect(screen.getByText('x')).toHaveClass(`badge--${size}`);
  });

  it('can keep the text as written with uppercase={false}', () => {
    render(<Badge uppercase={false}>demo</Badge>);
    expect(screen.getByText('demo')).not.toHaveClass('badge--uppercase');
  });

  it('draws a border only when bordered', () => {
    const { rerender } = render(<Badge>x</Badge>);
    expect(screen.getByText('x')).not.toHaveClass('badge--bordered');
    rerender(<Badge bordered>x</Badge>);
    expect(screen.getByText('x')).toHaveClass('badge--bordered');
  });

  it('renders the icon before the text', () => {
    render(<Badge icon={<svg data-testid="icon" />}>demo</Badge>);
    const el = screen.getByText('demo');
    expect(el.firstElementChild).toBe(screen.getByTestId('icon'));
  });

  it('forwards native attributes and appends a custom className', () => {
    render(<Badge title="Usuario de demostración" className="custom">demo</Badge>);
    const el = screen.getByText('demo');
    expect(el).toHaveAttribute('title', 'Usuario de demostración');
    expect(el).toHaveClass('badge', 'custom');
  });
});
