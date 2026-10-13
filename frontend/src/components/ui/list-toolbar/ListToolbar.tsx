import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../input';
import { CreateButton } from '../button';
import './ListToolbar.css';

export interface ListToolbarProps {
  search: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  /** Omit it to render the search without a create button. */
  create?: {
    label: string;
    to?: string;
    state?: unknown;
    onClick?: () => void;
  };
  /** Row rendered under the search bar, e.g. filter tabs. */
  filters?: ReactNode;
  className?: string;
}

/** Search + create button on one line, with an optional filters row below. */
export default function ListToolbar({ search, create, filters, className }: ListToolbarProps) {
  const classes = ['list-toolbar', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="list-toolbar__bar">
        <div className="list-toolbar__search">
          <span className="list-toolbar__search-icon">
            <Search size={18} />
          </span>
          <Input
            type="text"
            size="md"
            className="list-toolbar__input"
            placeholder={search.placeholder}
            aria-label={search.placeholder}
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
          />
        </div>
        {create && <CreateButton {...create} />}
      </div>
      {filters && <div className="list-toolbar__filters">{filters}</div>}
    </div>
  );
}
