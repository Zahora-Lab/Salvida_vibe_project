import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SegmentedControl } from './index';

const options = [
  { value: 'calendar', label: 'Calendario', icon: <svg data-testid="cal" /> },
  { value: 'list', label: 'Lista', icon: <svg data-testid="list" /> },
] as const;

describe('SegmentedControl', () => {
  it('marks the active option with aria-pressed', () => {
    render(<SegmentedControl options={options} value="list" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Lista' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Calendario' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with the value', () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="list" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Calendario' }));
    expect(onChange).toHaveBeenCalledWith('calendar');
  });

  it('renders the icon before the label', () => {
    render(<SegmentedControl options={options} value="list" onChange={() => {}} />);
    const button = screen.getByRole('button', { name: 'Lista' });
    expect(button.firstElementChild).toBe(screen.getByTestId('list'));
  });

  it('keeps an accessible name and tooltip when icon only', () => {
    render(
      <SegmentedControl
        options={[{ value: 'map', label: 'Mapa', icon: <svg />, iconOnly: true }]}
        value="map"
        onChange={() => {}}
      />,
    );
    const button = screen.getByRole('button', { name: 'Mapa' });
    expect(button).toHaveAttribute('title', 'Mapa');
    expect(button).not.toHaveTextContent('Mapa');
  });

  it.each(['filled', 'outlined'] as const)('applies variant="%s"', (variant) => {
    render(
      <SegmentedControl
        options={options}
        value="list"
        onChange={() => {}}
        variant={variant}
        ariaLabel="Vista"
      />,
    );
    expect(screen.getByRole('group', { name: 'Vista' })).toHaveClass(`segmented--${variant}`);
  });
});
