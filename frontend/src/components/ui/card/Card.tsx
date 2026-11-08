import type { ElementType, HTMLAttributes } from 'react';
import './Card.css';

export type CardPadding = 'none' | 'md';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Element to render, e.g. `li` inside a list. */
  as?: ElementType;
  /** `md` adds 1rem inside; `none` leaves the spacing to the content. */
  padding?: CardPadding;
  /** Hides whatever overflows the rounded corners. Leave it off if the content has popovers. */
  clip?: boolean;
}

/** White surface with a soft border and shadow that groups related content. */
export default function Card({
  as: Tag = 'div',
  padding = 'none',
  clip = false,
  className,
  ...rest
}: CardProps) {
  const classes = ['card', padding === 'md' && 'card--padded', clip && 'card--clip', className]
    .filter(Boolean)
    .join(' ');

  return <Tag {...rest} className={classes} />;
}
