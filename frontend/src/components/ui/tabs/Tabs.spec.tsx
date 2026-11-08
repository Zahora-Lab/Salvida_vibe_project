import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Tabs } from './index';

const options = [
  { value: 'login', label: 'Entrar' },
  { value: 'register', label: 'Registro' },
] as const;

describe('Tabs', () => {
  it('exposes a tablist with the active tab selected', () => {
    render(<Tabs options={options} value="register" onChange={() => {}} ariaLabel="Acceso" />);
    expect(screen.getByRole('tablist', { name: 'Acceso' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Registro' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Entrar' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with the value, not the event', () => {
    const onChange = vi.fn();
    render(<Tabs options={options} value="login" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Registro' }));
    expect(onChange).toHaveBeenCalledWith('register');
  });

  it('never submits a surrounding form', () => {
    render(<Tabs options={options} value="login" onChange={() => {}} />);
    screen.getAllByRole('tab').forEach((tab) => expect(tab).toHaveAttribute('type', 'button'));
  });

  it('stretches the tabs only when asked', () => {
    const { rerender } = render(<Tabs options={options} value="login" onChange={() => {}} />);
    expect(screen.getByRole('tablist')).not.toHaveClass('tabs--stretch');
    rerender(<Tabs options={options} value="login" onChange={() => {}} stretch />);
    expect(screen.getByRole('tablist')).toHaveClass('tabs--stretch');
  });
});
