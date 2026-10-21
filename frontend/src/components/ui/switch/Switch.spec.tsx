import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Switch } from './index';

describe('Switch', () => {
  it('is a switch with an accessible name and type="button"', () => {
    render(<Switch checked={false} onChange={() => {}} label="Email" />);
    const el = screen.getByRole('switch', { name: 'Email' });
    expect(el.tagName).toBe('BUTTON');
    expect(el).toHaveAttribute('type', 'button');
  });

  it('reflects the checked state in aria-checked and the on class', () => {
    const { rerender } = render(<Switch checked={false} onChange={() => {}} label="x" />);
    let el = screen.getByRole('switch');
    expect(el).toHaveAttribute('aria-checked', 'false');
    expect(el).not.toHaveClass('switch--on');

    rerender(<Switch checked onChange={() => {}} label="x" />);
    el = screen.getByRole('switch');
    expect(el).toHaveAttribute('aria-checked', 'true');
    expect(el).toHaveClass('switch--on');
  });

  it('reports the next value on click', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Switch checked={false} onChange={onChange} label="x" />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenLastCalledWith(true);

    rerender(<Switch checked onChange={onChange} label="x" />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('does not react when disabled', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="x" disabled />);
    const el = screen.getByRole('switch');
    expect(el).toBeDisabled();
    fireEvent.click(el);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('appends a custom className and forwards native attributes', () => {
    render(<Switch checked={false} onChange={() => {}} label="x" className="custom" id="demo" />);
    const el = screen.getByRole('switch');
    expect(el).toHaveClass('switch', 'custom');
    expect(el).toHaveAttribute('id', 'demo');
  });
});
