import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ListToolbar } from './index';

function renderToolbar(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ListToolbar', () => {
  it('renders the search input with its placeholder, value and accessible name', () => {
    renderToolbar(<ListToolbar search={{ value: 'ana', onChange: () => {}, placeholder: 'Buscar' }} />);
    const input = screen.getByPlaceholderText('Buscar');
    expect(input).toHaveValue('ana');
    expect(input).toHaveAccessibleName('Buscar');
  });

  it('calls onChange with the typed string, not the event', () => {
    const onChange = vi.fn();
    renderToolbar(<ListToolbar search={{ value: '', onChange, placeholder: 'Buscar' }} />);
    fireEvent.change(screen.getByPlaceholderText('Buscar'), { target: { value: 'luis' } });
    expect(onChange).toHaveBeenCalledWith('luis');
  });

  it('renders a single create button that fires onClick', () => {
    const onClick = vi.fn();
    renderToolbar(
      <ListToolbar
        search={{ value: '', onChange: () => {} }}
        create={{ label: 'Nuevo usuario', onClick }}
      />,
    );
    const buttons = screen.getAllByRole('button', { name: 'Nuevo usuario' });
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the create action as a link when `to` is given', () => {
    renderToolbar(
      <ListToolbar search={{ value: '', onChange: () => {} }} create={{ label: 'Nuevo', to: '/app/new' }} />,
    );
    expect(screen.getByRole('link', { name: 'Nuevo' })).toHaveAttribute('href', '/app/new');
  });

  it('renders no create action when `create` is omitted', () => {
    renderToolbar(<ListToolbar search={{ value: '', onChange: () => {} }} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders the filters row', () => {
    renderToolbar(
      <ListToolbar search={{ value: '', onChange: () => {} }} filters={<button>Activos</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Activos' })).toBeInTheDocument();
  });
});
