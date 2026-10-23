import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Chip.css';

export type ChipVariant = 'filled' | 'outlined' | 'tinted';
export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Whether this chip is the chosen one. Sets `aria-pressed`. */
  selected?: boolean;
  /**
   * `filled` is a grey pill that turns solid when selected, `outlined` is a bordered pill that
   * turns solid, `tinted` is a bordered pill that only gets a light tint.
   */
  variant?: ChipVariant;
  size?: ChipSize;
  children?: ReactNode;
}

/** Pill button for choosing one option out of a few, such as a filter or a sort key. */
export default function Chip({
  selected = false,
  variant = 'outlined',
  size = 'md',
  type = 'button',
  className,
  children,
  ...rest
}: ChipProps) {
  const classes = [
    'chip',
    `chip--${variant}`,
    `chip--${size}`,
    selected && 'chip--selected',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button {...rest} type={type} aria-pressed={selected} className={classes}>
      {children}
    </button>
  );
}
