import type { HTMLAttributes, ReactNode } from 'react';
import './Alert.css';

export type AlertTone = 'danger' | 'success';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** `danger` is announced right away, `success` politely. */
  tone?: AlertTone;
  children: ReactNode;
}

/** Inline message about the result of an action, such as a failed submit. */
export default function Alert({ tone = 'danger', className, children, ...rest }: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      {...rest}
      className={['alert', `alert--${tone}`, className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
