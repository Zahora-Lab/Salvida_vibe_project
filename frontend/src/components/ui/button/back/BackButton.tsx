import { ArrowLeft } from 'lucide-react';
import IconButton, { type IconButtonProps } from '../icon/IconButton';
import './BackButton.css';

/** `Omit` that keeps each member of a union separate (button vs link). */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type BackButtonProps = DistributiveOmit<IconButtonProps, 'icon' | 'label' | 'tone' | 'size'> & {
  /** Accessible name and tooltip. */
  label?: string;
};

/**
 * Arrow that takes the user one screen back. Pass `to` for a fixed route or `onClick`
 * (e.g. `navigate(-1)`). Spacing around it is up to the page, via `className`.
 */
export default function BackButton({ label = 'Volver', className, ...rest }: BackButtonProps) {
  return (
    <IconButton
      {...(rest as IconButtonProps)}
      label={label}
      icon={<ArrowLeft size={20} />}
      tone="primary"
      size="lg"
      className={['back-btn', className].filter(Boolean).join(' ')}
    />
  );
}
