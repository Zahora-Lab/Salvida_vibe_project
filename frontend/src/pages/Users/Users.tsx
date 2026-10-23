import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';
import Header from '../../components/layout/header/Header';
import { DropdownMenu } from '../../components/ui/dropdown-menu';
import type { DropdownItem } from '../../components/ui/dropdown-menu';
import { ListToolbar } from '../../components/ui/list-toolbar';
import { FilterTabs } from '../../components/ui/filter-tabs';
import {
  useUsers,
  useArchiveUser,
  useToggleUserDemo,
  useProfile,
} from '../../hooks/useProfile';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import CreateUserModal from '@/components/features/user/create-user-modal/CreateUserModal';
import UserCard from '@/components/features/user/user-card/UserCard';
import {
  ROLE_LABEL,
  getDisplayName,
  getInitials,
  roleTone,
} from '@/components/features/user/user-display/userDisplay';
import { Badge } from '../../components/ui/badge';
import type { UserProfile } from '../../types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';
import './Users.css';

export default function Users() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: liveProfile } = useProfile();
  const isSuperAdmin = liveProfile?.role === 'superadmin';
  const { data: users = [], isLoading } = useUsers(true);
  const archiveUser = useArchiveUser();
  const toggleDemo = useToggleUserDemo();
  const [query, setQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'active' | 'all' | 'archived'>(
    'all',
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  function buildMenuItems(user: UserProfile): DropdownItem[] {
    return [
      {
        label:
          user.isActive === false
            ? t('users.menu.restore')
            : t('users.menu.archive'),
        onClick: () => archiveUser.mutate(user.id),
        variant: user.isActive === false ? 'default' : 'danger',
      },
      ...(isSuperAdmin
        ? [
            {
              label: user.isDemo ? 'Quitar demo' : 'Marcar como demo',
              onClick: () =>
                toggleDemo.mutate({ userId: user.id, isDemo: !user.isDemo }),
              variant: 'default' as const,
            },
          ]
        : []),
    ];
  }

  const filtered = users.filter((user) => {
    if (statusTab === 'active' && user.isActive === false) return false;
    if (statusTab === 'archived' && user.isActive !== false) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        user.firstName?.toLowerCase().includes(q) ||
        user.lastName?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.organization?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="users">
      <Header title={t('users.title')} subtitle={t('users.subtitle')} />

      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} />
      )}

      <div className="users__body">
        <div className="users__inner">
          <ListToolbar
            search={{
              value: query,
              onChange: setQuery,
              placeholder: 'Buscar por nombre, email u organización…',
            }}
            create={{
              label: 'Nuevo usuario',
              onClick: () => setShowCreateModal(true),
            }}
            filters={
              <FilterTabs
                ariaLabel="Estado"
                value={statusTab}
                onChange={setStatusTab}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'active', label: 'Activos' },
                  { value: 'archived', label: 'Archivados' },
                ]}
              />
            }
          />

          {/* Mobile: one card per user, every value labelled with its column title */}
          {isMobile &&
            (isLoading ? (
              <ul className="users__cards" aria-busy="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card
                    as="li"
                    padding="md"
                    key={i}
                    className="users__card users__card--skeleton"
                  >
                    <Skeleton width="55%" />
                    <Skeleton width="80%" />
                    <Skeleton width="40%" />
                  </Card>
                ))}
              </ul>
            ) : filtered.length === 0 ? (
              <EmptyState bordered>{t('users.empty')}</EmptyState>
            ) : (
              <ul className="users__cards">
                {filtered.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    showDemo={isSuperAdmin}
                    menuItems={buildMenuItems(user)}
                    onOpen={() => navigate(`/app/settings?userId=${user.id}`)}
                  />
                ))}
              </ul>
            ))}

          {!isMobile && (
            <Card clip>
              <div className="users__table-scroll">
                <table className="users__table">
                  <thead>
                    <tr>
                      <th>{t('users.columns.user')}</th>
                      <th>Email</th>
                      <th>Organización</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="users__skeleton-row">
                          <td>
                            <Skeleton width="180px" />
                          </td>
                          <td>
                            <Skeleton width="160px" />
                          </td>
                          <td>
                            <Skeleton width="120px" />
                          </td>
                          <td>
                            <Skeleton width="60px" />
                          </td>
                          <td>
                            <Skeleton width="70px" />
                          </td>
                          <td />
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="users__empty-cell">
                          <EmptyState>{t('users.empty')}</EmptyState>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((user) => (
                        <tr
                          key={user.id}
                          className={
                            user.isActive === false
                              ? 'users__row--archived'
                              : ''
                          }
                        >
                          <td>
                            <button
                              className="user-link"
                              onClick={() =>
                                navigate(`/app/settings?userId=${user.id}`)
                              }
                            >
                              <Avatar
                                size="2rem"
                                src={user.avatar}
                                alt={user.firstName}
                              >
                                {getInitials(user)}
                              </Avatar>
                              <span className="user-link__name">
                                {getDisplayName(user)}
                              </span>
                            </button>
                          </td>
                          <td className="users__email">{user.email || '—'}</td>
                          <td className="users__org">
                            {user.organization || '—'}
                          </td>
                          <td>
                            <div className="users__role-cell">
                              <Badge size="md" tone={roleTone(user.role)}>
                                {user.role === 'user'
                                  ? t('userRoles.user')
                                  : (ROLE_LABEL[user.role ?? ''] ?? user.role)}
                              </Badge>
                              {isSuperAdmin && user.isDemo && (
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
                          </td>
                          <td>
                            <Badge
                              tone={
                                user.isActive === false ? 'neutral' : 'success'
                              }
                            >
                              {user.isActive === false ? 'Archivado' : 'Activo'}
                            </Badge>
                          </td>
                          <td>
                            <DropdownMenu items={buildMenuItems(user)} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
