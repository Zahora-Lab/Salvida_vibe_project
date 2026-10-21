import { Link } from 'react-router-dom';
import { Plus, PlusCircle } from 'lucide-react';
import Button from '../Button';
import './CreateButton.css';

export type CreateButtonVariant = 'solid' | 'dashed';
/**
 * `responsive`: one element, icon + text above 768px and a square "+" up to 768px.
 * `full`: icon + text, visible above 768px only.
 * `icon`: square "+" only, visible up to 768px only.
 */
export type CreateButtonDisplay = 'responsive' | 'full' | 'icon';

export interface CreateButtonProps {
  /** Visible text when shown; accessible name and tooltip whenever the text can be hidden. */
  label: string;
  /** Navigates to this route. Omit it and pass `onClick` for actions such as opening a modal. */
  to?: string;
  state?: unknown;
  onClick?: () => void;
  variant?: CreateButtonVariant;
  /** `dashed` is always rendered as `full`. */
  display?: CreateButtonDisplay;
  className?: string;
}

/** Button used by every "add / new" action, in desktop and mobile. */
export default function CreateButton({
  label,
  to,
  state,
  onClick,
  variant = 'solid',
  display = 'responsive',
  className,
}: CreateButtonProps) {
  if (variant === 'dashed') {
    return <DashedCreateButton label={label} to={to} state={state} onClick={onClick} className={className} />;
  }

  const classes = [`create-btn--${display}`, className].filter(Boolean).join(' ');
  const showLabel = display !== 'icon';
  // The text is hidden (display: none) at some widths, so keep an explicit accessible name.
  const a11y = display !== 'full' ? { 'aria-label': label, title: label } : {};
  const icon = <Plus size={display === 'icon' ? 20 : 16} />;
  const content = showLabel ? <span className="create-btn__label">{label}</span> : null;

  if (to) {
    return (
      <Button to={to} state={state} size="sm" icon={icon} className={classes} {...a11y}>
        {content}
      </Button>
    );
  }

  return (
    <Button size="sm" icon={icon} className={classes} onClick={onClick} {...a11y}>
      {content}
    </Button>
  );
}

/** Full-width dashed call to action (the "new booking" card). It has its own look, so it is not a Button. */
function DashedCreateButton({
  label,
  to,
  state,
  onClick,
  className,
}: Pick<CreateButtonProps, 'label' | 'to' | 'state' | 'onClick' | 'className'>) {
  const classes = ['create-btn', 'create-btn--dashed', 'create-btn--full', className]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      <PlusCircle size={20} />
      <span className="create-btn__label">{label}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} state={state} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
