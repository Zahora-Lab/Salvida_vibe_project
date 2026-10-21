import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Button } from './index';

function renderBtn(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Button (native)', () => {
  it('renders a primary md button by default', () => {
    renderBtn(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toHaveClass('btn', 'btn--primary', 'btn--md');
  });

  it('defaults to type="button" so it does not submit forms by accident', () => {
    renderBtn(<Button>Guardar</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('allows type="submit"', () => {
    renderBtn(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it.each(['primary', 'secondary', 'ghost', 'outline', 'dashed', 'danger'] as const)(
    'applies variant="%s"',
    (variant) => {
      renderBtn(<Button variant={variant}>x</Button>);
      expect(screen.getByRole('button')).toHaveClass(`btn--${variant}`);
    },
  );

  it.each(['lg', 'md', 'sm', 'xs'] as const)('applies size="%s"', (size) => {
    renderBtn(<Button size={size}>x</Button>);
    expect(screen.getByRole('button')).toHaveClass(`btn--${size}`);
  });

  it('applies fullWidth and a custom className', () => {
    renderBtn(<Button fullWidth className="custom">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn--full', 'custom');
  });

  it('calls onClick', () => {
    const onClick = vi.fn();
    renderBtn(<Button onClick={onClick}>x</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    renderBtn(<Button disabled onClick={onClick}>x</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading disables the button and sets aria-busy', () => {
    renderBtn(<Button loading>x</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('is not busy by default', () => {
    renderBtn(<Button>x</Button>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  it('renders the icon before the label', () => {
    renderBtn(<Button icon={<svg data-testid="icon" />}>Guardar</Button>);
    const btn = screen.getByRole('button');
    expect(btn.firstElementChild).toBe(screen.getByTestId('icon'));
    expect(btn).toHaveTextContent('Guardar');
  });
});

describe('Button (link)', () => {
  it('renders a router link with button classes when `to` is given', () => {
    renderBtn(<Button to="/app/prms">Cancelar</Button>);
    const link = screen.getByRole('link', { name: 'Cancelar' });
    expect(link).toHaveAttribute('href', '/app/prms');
    expect(link).toHaveClass('btn', 'btn--primary');
  });

  it('supports variants on links', () => {
    renderBtn(<Button to="/x" variant="outline">Volver</Button>);
    expect(screen.getByRole('link')).toHaveClass('btn--outline');
  });
});
