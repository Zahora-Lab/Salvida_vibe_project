import type { CSSProperties, HTMLAttributes } from 'react';
import './Skeleton.css';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** CSS length. A number is read as px. */
  width?: number | string;
  /** CSS length. A number is read as px. Defaults to one line of text. */
  height?: number | string;
  /** Corner radius. A number is read as px. */
  radius?: number | string;
}

const toLength = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value;

/** Shimmering placeholder shown while content loads. Decorative, so it is hidden from assistive tech. */
export default function Skeleton({ width, height, radius, className, style, ...rest }: SkeletonProps) {
  const sized: CSSProperties = {
    width: toLength(width),
    height: toLength(height),
    ...(radius !== undefined && { '--skeleton-radius': toLength(radius) }),
    ...style,
  };

  return (
    <div
      {...rest}
      aria-hidden="true"
      className={['skeleton', className].filter(Boolean).join(' ')}
      style={sized}
    />
  );
}
