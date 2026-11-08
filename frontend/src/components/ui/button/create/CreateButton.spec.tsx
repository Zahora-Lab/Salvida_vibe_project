import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreateButton } from '../index';

function renderBtn(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('CreateButton', () => {
  it('is responsive by default: text in the DOM plus an accessible name', () => {
    renderBtn(<CreateButton label="Nuevo" onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Nuevo' });
    expect(btn).toHaveClass('btn', 'btn--primary', 'btn--sm', 'create-btn--responsive');
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).toHaveAttribute('aria-label', 'Nuevo');
    expect(btn).toHaveTextContent('Nuevo');
  });

  it('full display shows the text without a redundant aria-label', () => {
    renderBtn(<CreateButton label="Nuevo" display="full" onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Nuevo' });
    expect(btn).toHaveClass('create-btn--full');
    expect(btn).not.toHaveAttribute('aria-label');
  });

  it('calls onClick', () => {
    const onClick = vi.fn();
    renderBtn(<CreateButton label="Nuevo" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a link when `to` is provided', () => {
    renderBtn(<CreateButton label="Nuevo" to="/app/new" />);
    expect(screen.getByRole('link', { name: 'Nuevo' })).toHaveAttribute('href', '/app/new');
  });

  it('icon display hides the text and exposes label and title', () => {
    renderBtn(<CreateButton label="Nuevo" display="icon" onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Nuevo' });
    expect(btn).toHaveClass('create-btn--icon');
    expect(btn).toHaveAttribute('title', 'Nuevo');
    expect(btn).toHaveTextContent('');
  });

  it('dashed is always rendered as full, even if icon is requested', () => {
    renderBtn(<CreateButton label="Nueva reserva" variant="dashed" display="icon" to="/x" />);
    const link = screen.getByRole('link', { name: 'Nueva reserva' });
    expect(link).toHaveClass('create-btn--dashed', 'create-btn--full');
    expect(link).not.toHaveClass('create-btn--icon');
  });

  it('appends a custom className', () => {
    renderBtn(<CreateButton label="Nuevo" className="custom" onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('btn', 'create-btn--responsive', 'custom');
  });

  it('the solid button is a Button; the dashed one is not', () => {
    renderBtn(
      <>
        <CreateButton label="Solido" onClick={() => {}} />
        <CreateButton label="Punteado" variant="dashed" onClick={() => {}} />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Solido' })).toHaveClass('btn');
    expect(screen.getByRole('button', { name: 'Punteado' })).not.toHaveClass('btn');
  });

  it('dashed keeps its text visible and has no aria-label', () => {
    renderBtn(<CreateButton label="Nueva reserva" variant="dashed" onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Nueva reserva' });
    expect(btn).not.toHaveAttribute('aria-label');
    expect(btn).toHaveTextContent('Nueva reserva');
  });
});
