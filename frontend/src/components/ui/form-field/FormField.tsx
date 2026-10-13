import { useId, type ReactNode } from 'react';
import './FormField.css';

export type FormFieldVariant = 'default' | 'small' | 'eyebrow';

/** Props to spread on the control so label, error and state are wired together. */
export interface FormFieldControlProps {
  id: string;
  status?: 'error';
  'aria-describedby'?: string;
  'aria-required'?: true;
}

export interface FormFieldProps {
  label: ReactNode;
  /**
   * `id` of the control. Needed when `children` is a plain node (the control sets its own id);
   * with the render-prop form it overrides the generated id.
   */
  htmlFor?: string;
  required?: boolean;
  /** Error message. Also switches the control to `status="error"` in the render-prop form. */
  error?: string;
  variant?: FormFieldVariant;
  className?: string;
  children: ReactNode | ((control: FormFieldControlProps) => ReactNode);
}

/** Label + control + error message, wired for accessibility. */
export default function FormField({
  label,
  htmlFor,
  required,
  error,
  variant = 'default',
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;
  const errorId = `${id}-error`;
  const classes = ['form-field', `form-field--${variant}`, className].filter(Boolean).join(' ');

  const control: FormFieldControlProps = {
    id,
    status: error ? 'error' : undefined,
    'aria-describedby': error ? errorId : undefined,
    'aria-required': required ? true : undefined,
  };

  return (
    <div className={classes}>
      <label className="form-field__label" htmlFor={id}>
        {label}
        {required && (
          <>
            {' '}
            <span className="form-field__required" aria-hidden="true">
              *
            </span>
          </>
        )}
      </label>
      {typeof children === 'function' ? children(control) : children}
      {error && (
        <p id={errorId} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
