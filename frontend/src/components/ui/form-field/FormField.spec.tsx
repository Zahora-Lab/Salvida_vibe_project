import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './index';
import { Input } from '../input';

describe('FormField (render-prop)', () => {
  it('links the label to the control with a generated id', () => {
    render(<FormField label="Email">{(field) => <Input {...field} type="email" />}</FormField>);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
    expect(screen.getByText('Email')).toHaveAttribute('for', input.id);
  });

  it('uses htmlFor as the control id when provided', () => {
    render(<FormField label="Nombre" htmlFor="name">{(field) => <Input {...field} />}</FormField>);
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('id', 'name');
  });

  it('wires the error: message, status, aria-invalid and aria-describedby', () => {
    render(
      <FormField label="Email" error="Email inválido">
        {(field) => <Input {...field} />}
      </FormField>,
    );
    const input = screen.getByLabelText('Email');
    const message = screen.getByRole('alert');
    expect(message).toHaveTextContent('Email inválido');
    expect(input).toHaveClass('input--error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', message.id);
  });

  it('has no error wiring when there is no error', () => {
    render(<FormField label="Email">{(field) => <Input {...field} />}</FormField>);
    const input = screen.getByLabelText('Email');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).not.toHaveClass('input--error');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('marks required visually and for assistive technology', () => {
    render(<FormField label="Nombre" required>{(field) => <Input {...field} />}</FormField>);
    expect(screen.getByLabelText('Nombre', { exact: false })).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('FormField (plain node)', () => {
  it('renders the control as is and links the label through htmlFor', () => {
    render(
      <FormField label="Estado" htmlFor="status">
        <select id="status">
          <option>Activo</option>
        </select>
      </FormField>,
    );
    expect(screen.getByLabelText('Estado')).toHaveAttribute('id', 'status');
  });

  it('shows the error message', () => {
    render(
      <FormField label="Estado" htmlFor="status" error="Requerido">
        <select id="status" />
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
  });
});

describe('FormField variants', () => {
  it.each(['default', 'small', 'eyebrow'] as const)('applies variant="%s"', (variant) => {
    const { container } = render(
      <FormField label="x" variant={variant}>{(field) => <Input {...field} />}</FormField>,
    );
    expect(container.firstElementChild).toHaveClass('form-field', `form-field--${variant}`);
  });

  it('appends a custom className', () => {
    const { container } = render(
      <FormField label="x" className="custom">{(field) => <Input {...field} />}</FormField>,
    );
    expect(container.firstElementChild).toHaveClass('form-field', 'custom');
  });
});
