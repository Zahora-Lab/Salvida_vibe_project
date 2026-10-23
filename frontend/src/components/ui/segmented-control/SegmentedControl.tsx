import type { ReactNode } from 'react';
import './SegmentedControl.css';

export type SegmentedControlVariant = 'filled' | 'outlined';

export interface SegmentedOption<T extends string> {
  value: T;
  /** Visible text. With `iconOnly` it becomes the accessible name and the tooltip. */
  label: string;
  icon?: ReactNode;
  /** Square button with only the icon. */
  iconOnly?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** `filled` sits on a tinted track, `outlined` on a white track with a border. */
  variant?: SegmentedControlVariant;
  /** Accessible name of the group. */
  ariaLabel?: string;
  className?: string;
}

/** Pill-shaped single choice between a few views, usually with icons. */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'filled',
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const classes = ['segmented', `segmented--${variant}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value;
        const optionClasses = [
          'segmented__option',
          active && 'segmented__option--active',
          option.iconOnly && 'segmented__option--icon-only',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button
            key={option.value}
            type="button"
            className={optionClasses}
            aria-pressed={active}
            aria-label={option.iconOnly ? option.label : undefined}
            title={option.iconOnly ? option.label : undefined}
            onClick={() => onChange(option.value)}
          >
            {option.icon}
            {!option.iconOnly && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
