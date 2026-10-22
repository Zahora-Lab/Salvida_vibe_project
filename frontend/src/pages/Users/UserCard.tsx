import { FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DropdownMenu from '../../components/ui/dropdown-menu/DropdownMenu';
import type { DropdownItem } from '../../components/ui/dropdown-menu/DropdownMenu';
import type { UserProfile } from '../../types';
import { ROLE_LABEL, getDisplayName, getInitials, roleTone } from './userDisplay';
import { Badge } from '../../components/ui/badge';

interface UserCardProps {
  user: UserProfile;
  showDemo: boolean;
  menuItems: DropdownItem[];
  onOpen: () => void;
}

/** Mobile counterpart of a table row. Every value carries its column title. */
export default function UserCard({ user, showDemo, menuItems, onOpen }: UserCardProps) {
  const { t } = useTranslation();
  const isArchived = user.isActive === false;

  return (
    <li className={`users__card${isArchived ? ' users__card--archived' : ''}`}>
      <div className="users__card-head">
        <button type="button" className="user-link users__card-link" onClick={onOpen}>
          <div className="user-link__avatar">
            {user.avatar ? <img src={user.avatar} alt={user.firstName} /> : getInitials(user)}
          </div>
          <span className="user-link__name">{getDisplayName(user)}</span>
        </button>
        <DropdownMenu items={menuItems} />
      </div>

      <dl className="users__card-fields">
        <div className="users__card-field users__card-field--full">
          <dt>Email</dt>
          <dd className="users__card-text">{user.email || '—'}</dd>
        </div>

        <div className="users__card-field users__card-field--full">
          <dt>Organización</dt>
          <dd className="users__card-text">{user.organization || '—'}</dd>
        </div>

        <div className="users__card-field">
          <dt>Rol</dt>
          <dd>
            <div className="users__role-cell">
              <Badge size="md" tone={roleTone(user.role)}>
                {user.role === 'user' ? t('userRoles.user') : (ROLE_LABEL[user.role ?? ''] ?? user.role)}
              </Badge>
              {showDemo && user.isDemo && (
                <Badge
                  size="md"
                  tone="warning"
                  icon={<FlaskConical size={12} />}
                  title={t('users.demo')}
                >
                  demo
                </Badge>
              )}
            </div>
          </dd>
        </div>

        <div className="users__card-field">
          <dt>Estado</dt>
          <dd>
            <Badge tone={isArchived ? 'neutral' : 'success'}>
              {isArchived ? 'Archivado' : 'Activo'}
            </Badge>
          </dd>
        </div>
      </dl>
    </li>
  );
}
