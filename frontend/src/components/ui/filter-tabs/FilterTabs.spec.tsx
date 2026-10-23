import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FilterTabs } from './index';

const OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'archived', label: 'Archivados' },
] as const;

describe('FilterTabs', () => {
  it('renders one button per option, in order', () => {
    render(<FilterTabs options={OPTIONS} value="all" onChange={() => {}} />);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Todos',
      'Activos',
      'Archivados',
    ]);
  });

  it('marks only the selected option as active and pressed', () => {
    render(<FilterTabs options={OPTIONS} value="active" onChange={() => {}} />);
    const active = screen.getByRole('button', { name: 'Activos' });
    expect(active).toHaveAttribute('aria-pressed', 'true');
    expect(active).toHaveClass('chip--selected');

    const other = screen.getByRole('button', { name: 'Todos' });
    expect(other).toHaveAttribute('aria-pressed', 'false');
    expect(other).not.toHaveClass('chip--selected');
  });

  it('calls onChange with the option value', () => {
    const onChange = vi.fn();
    render(<FilterTabs options={OPTIONS} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Archivados' }));
    expect(onChange).toHaveBeenCalledWith('archived');
  });

  it('exposes an accessible group name and does not submit forms', () => {
    render(<FilterTabs options={OPTIONS} value="all" onChange={() => {}} ariaLabel="Estado" />);
    expect(screen.getByRole('group', { name: 'Estado' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('type', 'button');
  });
});
