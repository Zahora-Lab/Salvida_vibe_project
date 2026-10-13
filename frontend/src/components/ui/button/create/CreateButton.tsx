import { Link } from 'react-router-dom';
import { Plus, PlusCircle } from 'lucide-react';
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
  const mode: CreateButtonDisplay = variant === 'dashed' ? 'full' : display;
  const classes = ['create-btn', `create-btn--${variant}`, `create-btn--${mode}`, className]
    .filter(Boolean)
    .join(' ');

  const icon =
    variant === 'dashed' ? <PlusCircle size={20} /> : <Plus size={mode === 'icon' ? 20 : 16} />;
  const content = (
    <>
      {icon}
      {mode !== 'icon' && <span className="create-btn__label">{label}</span>}
    </>
  );
  // The text is hidden (display: none) at some widths, so keep an explicit accessible name.
  const a11y = mode !== 'full' ? { 'aria-label': label, title: label } : {};

  if (to) {
    return (
      <Link to={to} state={state} className={classes} {...a11y}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} {...a11y}>
      {content}
    </button>
  );
}
