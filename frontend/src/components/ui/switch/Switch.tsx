import type { ButtonHTMLAttributes } from 'react';
import './Switch.css';

export interface SwitchProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'onChange' | 'onClick' | 'role' | 'type' | 'children' | 'aria-checked' | 'aria-label'
  > {
  checked: boolean;
  /** Receives the next value, so callers never have to negate `checked` themselves. */
  onChange: (checked: boolean) => void;
  /** Accessible name. Required: the switch has no text of its own. */
  label: string;
}

/** On/off toggle for a setting that applies immediately (`role="switch"`). */
export default function Switch({ checked, onChange, label, className, ...rest }: SwitchProps) {
  const classes = ['switch', checked && 'switch--on', className].filter(Boolean).join(' ');

  return (
    <button
      {...rest}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={classes}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__thumb" />
    </button>
  );
}
