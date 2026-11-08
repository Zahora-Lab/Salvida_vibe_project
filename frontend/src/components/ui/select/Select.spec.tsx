import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Select } from './index';
import { FormField } from '../form-field';

const OPTIONS = (
  <>
    <option value="">—</option>
    <option value="a">A</option>
    <option value="b">B</option>
  </>
);

describe('Select', () => {
  it('renders a native select with its options and the outlined lg defaults', () => {
    render(<Select aria-label="grupo">{OPTIONS}</Select>);
    const el = screen.getByRole('combobox', { name: 'grupo' });
    expect(el.tagName).toBe('SELECT');
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(el).toHaveClass('input', 'input--outlined', 'input--lg', 'select');
  });

  it.each(['outlined', 'filled', 'filled-bordered', 'compact'] as const)('applies variant="%s"', (variant) => {
    render(<Select variant={variant} aria-label="x">{OPTIONS}</Select>);
    expect(screen.getByRole('combobox')).toHaveClass(`input--${variant}`);
  });

  it.each(['lg', 'md', 'sm', 'xs'] as const)('applies size="%s"', (size) => {
    render(<Select size={size} aria-label="x">{OPTIONS}</Select>);
    expect(screen.getByRole('combobox')).toHaveClass(`input--${size}`);
  });

  it('marks the error status and exposes aria-invalid', () => {
    render(<Select status="error" aria-label="x">{OPTIONS}</Select>);
    const el = screen.getByRole('combobox');
    expect(el).toHaveClass('input--error');
    expect(el).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no error wiring by default', () => {
    render(<Select aria-label="x">{OPTIONS}</Select>);
    const el = screen.getByRole('combobox');
    expect(el).not.toHaveClass('input--error');
    expect(el).not.toHaveAttribute('aria-invalid');
  });

  it('is controlled: shows the value and reports changes', () => {
    const onChange = vi.fn();
    render(<Select aria-label="x" value="a" onChange={onChange}>{OPTIONS}</Select>);
    const el = screen.getByRole('combobox') as HTMLSelectElement;
    expect(el.value).toBe('a');
    fireEvent.change(el, { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('appends a custom className without dropping the base classes', () => {
    render(<Select aria-label="x" className="custom">{OPTIONS}</Select>);
    expect(screen.getByRole('combobox')).toHaveClass('input', 'select', 'custom');
  });

  it('forwards the ref to the underlying select', () => {
    const ref = createRef<HTMLSelectElement>();
    render(<Select ref={ref} aria-label="x">{OPTIONS}</Select>);
    expect(ref.current).toBe(screen.getByRole('combobox'));
  });

  it('works with the FormField render-prop: label, error and wiring', () => {
    render(
      <FormField label="Rol" error="Requerido">
        {(field) => <Select {...field}>{OPTIONS}</Select>}
      </FormField>,
    );
    const el = screen.getByLabelText('Rol');
    expect(el.tagName).toBe('SELECT');
    expect(el).toHaveClass('input--error');
    expect(el).toHaveAttribute('aria-describedby', screen.getByRole('alert').id);
  });
});
