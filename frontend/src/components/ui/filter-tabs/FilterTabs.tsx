import { Chip } from '../chip';
import './FilterTabs.css';

export interface FilterTabOption<T extends string> {
  value: T;
  label: string;
}

export interface FilterTabsProps<T extends string> {
  options: ReadonlyArray<FilterTabOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group, e.g. "Estado". */
  ariaLabel?: string;
  className?: string;
}

/** Pill-shaped single-choice filter. */
export default function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: FilterTabsProps<T>) {
  const classes = ['filter-tabs', className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Chip
            key={option.value}
            variant="filled"
            selected={active}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Chip>
        );
      })}
    </div>
  );
}
