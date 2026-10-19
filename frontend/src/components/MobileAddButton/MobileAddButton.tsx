import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import './MobileAddButton.css';

interface MobileAddButtonProps {
  /** Accessible name (the button only shows a "+" icon). */
  label: string;
  /** Navigates to this route. Omit it and pass `onClick` for actions such as opening a modal. */
  to?: string;
  state?: unknown;
  onClick?: () => void;
}

/**
 * Compact "+" button used on mobile in place of the long "add / new" buttons.
 * It is hidden above 768px, where each page keeps its full-text button.
 */
export default function MobileAddButton({ label, to, state, onClick }: MobileAddButtonProps) {
  if (to) {
    return (
      <Link to={to} state={state} className="mobile-add-btn" aria-label={label} title={label}>
        <Plus size={22} />
      </Link>
    );
  }

  return (
    <button type="button" className="mobile-add-btn" onClick={onClick} aria-label={label} title={label}>
      <Plus size={22} />
    </button>
  );
}
