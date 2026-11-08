import type { CSSProperties, HTMLAttributes } from 'react';
import './Spinner.css';

export type SpinnerTone = 'primary' | 'current';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** CSS length of the ring. A number is read as px. Defaults to 2.5rem. */
  size?: number | string;
  /** `primary` uses the brand color on a light track; `current` follows the text color, for use inside buttons. */
  tone?: SpinnerTone;
}

/** Spinning ring for work in progress. Decorative by default: put the status text next to it. */
export default function Spinner({ size, tone = 'primary', className, style, ...rest }: SpinnerProps) {
  const sized: CSSProperties = {
    ...(size !== undefined && { '--spinner-size': typeof size === 'number' ? `${size}px` : size }),
    ...style,
  };

  return (
    <span
      aria-hidden="true"
      {...rest}
      className={['spinner', `spinner--${tone}`, className].filter(Boolean).join(' ')}
      style={sized}
    />
  );
}
