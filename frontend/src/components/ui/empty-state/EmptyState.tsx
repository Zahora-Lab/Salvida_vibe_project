import type { HTMLAttributes, ReactNode } from 'react';
import './EmptyState.css';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Icon shown above the message. */
  icon?: ReactNode;
  /** Draws it as a white card with a border. */
  bordered?: boolean;
  /** Amount of breathing room around the message. */
  size?: EmptyStateSize;
  children: ReactNode;
}

/** Message shown where a list or table has nothing to show. */
export default function EmptyState({
  icon,
  bordered = false,
  size = 'md',
  className,
  children,
  ...rest
}: EmptyStateProps) {
  const classes = ['empty-state', `empty-state--${size}`, bordered && 'empty-state--bordered', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div {...rest} className={classes}>
      {icon}
      <p>{children}</p>
    </div>
  );
}
