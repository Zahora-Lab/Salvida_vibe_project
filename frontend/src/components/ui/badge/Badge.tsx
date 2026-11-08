import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Meaning of the badge. One background/text pair per tone across the whole app. */
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Icon rendered before the text. */
  icon?: ReactNode;
  /** Draws a 1px border in the tone color. */
  bordered?: boolean;
  /** Upper case with letter spacing (default). Set to `false` to keep the text as written. */
  uppercase?: boolean;
  children?: ReactNode;
}

/** Small pill that labels a state or a category. */
export default function Badge({
  tone = 'neutral',
  size = 'sm',
  icon,
  bordered = false,
  uppercase = true,
  className,
  children,
  ...rest
}: BadgeProps) {
  const classes = [
    'badge',
    `badge--${tone}`,
    `badge--${size}`,
    bordered && 'badge--bordered',
    uppercase && 'badge--uppercase',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span {...rest} className={classes}>
      {icon}
      {children}
    </span>
  );
}
