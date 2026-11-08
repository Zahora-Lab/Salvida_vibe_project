import { forwardRef, type SelectHTMLAttributes } from 'react';
import type { InputSize, InputStatus, InputVariant } from '../input';
// A select is a field like any text input: it reuses its variants, sizes, status and theme tokens.
import '../input/base/BaseInput.css';
import './Select.css';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  /** Validation state. Also sets `aria-invalid`. */
  status?: InputStatus;
}

/**
 * Native <select> styled like `Input`. The option list is drawn by the browser (and mobile OS),
 * which keeps keyboard, accessibility and the native picker for free.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { variant = 'outlined', size = 'lg', status, className, children, ...rest },
  ref,
) {
  const classes = [
    'input',
    `input--${variant}`,
    `input--${size}`,
    status && `input--${status}`,
    'select',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <select
      ref={ref}
      className={classes}
      aria-invalid={status === 'error' ? true : undefined}
      {...rest}
    >
      {children}
    </select>
  );
});

export default Select;
