import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BackButton } from '../index';

function renderBtn(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('BackButton', () => {
  it('is an icon button named "Volver" by default', () => {
    renderBtn(<BackButton onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Volver' });
    expect(btn).toHaveAttribute('title', 'Volver');
    expect(btn).toHaveClass('icon-btn', 'icon-btn--primary', 'icon-btn--lg', 'back-btn');
  });

  it('accepts another accessible name', () => {
    renderBtn(<BackButton label="Atrás" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Atrás' })).toBeInTheDocument();
  });

  it('calls onClick', () => {
    const onClick = vi.fn();
    renderBtn(<BackButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a link when `to` is given', () => {
    renderBtn(<BackButton to="/app/prms" />);
    const link = screen.getByRole('link', { name: 'Volver' });
    expect(link).toHaveAttribute('href', '/app/prms');
    expect(link).toHaveClass('back-btn');
  });

  it('keeps the page className next to its own', () => {
    renderBtn(<BackButton className="page__back" onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('back-btn', 'page__back');
  });
});
