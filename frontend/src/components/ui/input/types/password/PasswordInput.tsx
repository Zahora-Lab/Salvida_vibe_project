import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import BaseInput, { type BaseInputProps } from '../../base/BaseInput';
import './PasswordInput.css';

export interface PasswordInputProps extends Omit<BaseInputProps, 'type'> {
  /** Accessible label for the toggle while the password is hidden. */
  showLabel?: string;
  /** Accessible label for the toggle while the password is visible. */
  hideLabel?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { showLabel = 'Show password', hideLabel = 'Hide password', className, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input">
      <BaseInput
        {...rest}
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={['password-input__field', className].filter(Boolean).join(' ')}
      />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? hideLabel : showLabel}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});

export default PasswordInput;
