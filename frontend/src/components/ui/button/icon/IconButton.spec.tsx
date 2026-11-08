import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IconButton } from '../index';

function renderBtn(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const ICON = <svg data-testid="icon" />;

describe('IconButton (native)', () => {
  it('exposes the label as accessible name and tooltip', () => {
    renderBtn(<IconButton label="Cerrar" icon={ICON} />);
    const btn = screen.getByRole('button', { name: 'Cerrar' });
    expect(btn).toHaveAttribute('title', 'Cerrar');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('is a neutral sm button of type="button" by default', () => {
    renderBtn(<IconButton label="x" icon={ICON} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('icon-btn', 'icon-btn--neutral', 'icon-btn--sm');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it.each(['neutral', 'primary', 'danger'] as const)('applies tone="%s"', (tone) => {
    renderBtn(<IconButton label="x" icon={ICON} tone={tone} />);
    expect(screen.getByRole('button')).toHaveClass(`icon-btn--${tone}`);
  });

  it.each(['xs', 'sm', 'md', 'lg'] as const)('applies size="%s"', (size) => {
    renderBtn(<IconButton label="x" icon={ICON} size={size} />);
    expect(screen.getByRole('button')).toHaveClass(`icon-btn--${size}`);
  });

  it('calls onClick and respects disabled', () => {
    const onClick = vi.fn();
    const { rerender } = renderBtn(<IconButton label="x" icon={ICON} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <MemoryRouter>
        <IconButton label="x" icon={ICON} onClick={onClick} disabled />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards the ref to the button (needed to position menus)', () => {
    const ref = createRef<HTMLButtonElement>();
    renderBtn(<IconButton ref={ref} label="Más opciones" icon={ICON} />);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('appends a custom className', () => {
    renderBtn(<IconButton label="x" icon={ICON} className="custom" />);
    expect(screen.getByRole('button')).toHaveClass('icon-btn', 'custom');
  });
});

describe('IconButton (link)', () => {
  it('renders a router link with the label as accessible name', () => {
    renderBtn(<IconButton to="/app/prms" label="Volver" icon={ICON} />);
    const link = screen.getByRole('link', { name: 'Volver' });
    expect(link).toHaveAttribute('href', '/app/prms');
    expect(link).toHaveAttribute('title', 'Volver');
    expect(link).toHaveClass('icon-btn');
  });
});
