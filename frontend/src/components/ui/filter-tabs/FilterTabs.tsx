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
          <button
            key={option.value}
            type="button"
            className={`filter-tabs__tab${active ? ' filter-tabs__tab--active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
