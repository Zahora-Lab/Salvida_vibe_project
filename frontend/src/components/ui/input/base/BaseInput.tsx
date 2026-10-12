import { forwardRef, type InputHTMLAttributes } from 'react';
import './BaseInput.css';

export type InputVariant = 'outlined';
export type InputSize = 'lg' | 'md' | 'sm' | 'xs';
export type InputStatus = 'error';

export interface BaseInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual style. Add new variants here as the inventory of inputs grows. */
  variant?: InputVariant;
  /** Padding, radius and font size. */
  size?: InputSize;
  /** Validation state. Also sets `aria-invalid`. */
  status?: InputStatus;
}

/** Bare styled <input>. Internal building block: consumers should use `Input`. */
const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(function BaseInput(
  { variant = 'outlined', size = 'lg', status, className, type = 'text', ...rest },
  ref,
) {
  const classes = [
    'input',
    `input--${variant}`,
    `input--${size}`,
    status && `input--${status}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <input
      ref={ref}
      type={type}
      className={classes}
      aria-invalid={status === 'error' ? true : undefined}
      {...rest}
    />
  );
});

export default BaseInput;
