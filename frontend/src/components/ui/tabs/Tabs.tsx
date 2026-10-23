import './Tabs.css';

export interface TabOption<T extends string> {
  value: T;
  label: string;
}

export interface TabsProps<T extends string> {
  options: ReadonlyArray<TabOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the tab list. */
  ariaLabel?: string;
  /** Tabs share the width equally instead of sitting at their natural size. */
  stretch?: boolean;
  className?: string;
}

/** Underlined tabs that switch between sibling views. */
export default function Tabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  stretch = false,
  className,
}: TabsProps<T>) {
  const classes = ['tabs', stretch && 'tabs--stretch', className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="tablist" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`tabs__tab${active ? ' tabs__tab--active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
