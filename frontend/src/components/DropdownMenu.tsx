import { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { IconButton } from './ui/button';
import './DropdownMenu.css';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export default function DropdownMenu({ items, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen((prev) => {
      if (!prev && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const style: React.CSSProperties = {
          top: rect.bottom + 4,
        };
        if (align === 'right') {
          style.right = window.innerWidth - rect.right;
        } else {
          style.left = rect.left;
        }
        setMenuStyle(style);
      }
      return !prev;
    });
  };

  return (
    <div ref={ref} className="dropdown">
      <IconButton
        ref={triggerRef}
        label="Más opciones"
        icon={<MoreVertical size={18} />}
        tone="primary"
        size="xs"
        onClick={handleToggle}
      />

      {open && (
        <div
          className="dropdown__menu"
          style={menuStyle}
          role="menu"
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={(event) => {
                event.stopPropagation();
                item.onClick();
                setOpen(false);
              }}
              className={`dropdown__item ${item.variant === 'danger' ? 'dropdown__item--danger' : ''}`}
              role="menuitem"
            >
              {item.icon && <span className="dropdown__item-icon">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
