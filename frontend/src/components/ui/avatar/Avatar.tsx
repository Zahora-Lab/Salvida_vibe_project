import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './Avatar.css';

export type AvatarTone = 'primary' | 'solid';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Image URL. When set, `children` is not rendered. */
  src?: string | null;
  /** Alternative text of the image. */
  alt?: string;
  /** `primary` is a soft tint, `solid` is the full brand color. */
  tone?: AvatarTone;
  /** CSS length of the circle. A number is read as px. Defaults to 2.5rem. */
  size?: number | string;
  /** Shown when there is no `src`, usually the initials. */
  children?: ReactNode;
}

/** Round picture of a person, with the initials as the fallback. */
export default function Avatar({
  src,
  alt = '',
  tone = 'primary',
  size,
  className,
  style,
  children,
  ...rest
}: AvatarProps) {
  const sized: CSSProperties = {
    ...(size !== undefined && { '--avatar-size': typeof size === 'number' ? `${size}px` : size }),
    ...style,
  };

  return (
    <span
      {...rest}
      className={['avatar', `avatar--${tone}`, className].filter(Boolean).join(' ')}
      style={sized}
    >
      {src ? <img className="avatar__img" src={src} alt={alt} /> : children}
    </span>
  );
}
