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
import { ROLE_LABEL, getDisplayName, getInitials, roleTone } from '@/components/features/user/user-display/userDisplay';
import { Badge } from '../../components/ui/badge';
import type { UserProfile } from '../../types';
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

  function buildMenuItems(u: UserProfile): DropdownItem[] {
    return [
      {
        label:
          u.isActive === false
            ? t('users.menu.restore')
            : t('users.menu.archive'),
        onClick: () => archiveUser.mutate(u.id),
        variant: u.isActive === false ? 'default' : 'danger',
      },
      ...(isSuperAdmin
        ? [
            {
              label: u.isDemo ? 'Quitar demo' : 'Marcar como demo',
              onClick: () =>
                toggleDemo.mutate({ userId: u.id, isDemo: !u.isDemo }),
              variant: 'default' as const,
            },
          ]
        : []),
    ];
  }

  const filtered = users.filter((u) => {
    if (statusTab === 'active' && u.isActive === false) return false;
    if (statusTab === 'archived' && u.isActive !== false) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.organization?.toLowerCase().includes(q)
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
                  <li key={i} className="users__card users__card--skeleton">
                    <div className="users__skeleton" style={{ width: '55%' }} />
                    <div className="users__skeleton" style={{ width: '80%' }} />
                    <div className="users__skeleton" style={{ width: '40%' }} />
                  </li>
                ))}
              </ul>
            ) : filtered.length === 0 ? (
              <p className="users__empty users__empty--card">
                {t('users.empty')}
              </p>
            ) : (
              <ul className="users__cards">
                {filtered.map((u) => (
                  <UserCard
                    key={u.id}
                    user={u}
                    showDemo={isSuperAdmin}
                    menuItems={buildMenuItems(u)}
                    onOpen={() => navigate(`/app/settings?userId=${u.id}`)}
                  />
                ))}
              </ul>
            ))}

          {!isMobile && (
            <div className="users__table-wrap">
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
                            <div
                              className="users__skeleton"
                              style={{ width: '180px' }}
                            />
                          </td>
                          <td>
                            <div
                              className="users__skeleton"
                              style={{ width: '160px' }}
                            />
                          </td>
                          <td>
                            <div
                              className="users__skeleton"
                              style={{ width: '120px' }}
                            />
                          </td>
                          <td>
                            <div
                              className="users__skeleton"
                              style={{ width: '60px' }}
                            />
                          </td>
                          <td>
                            <div
                              className="users__skeleton"
                              style={{ width: '70px' }}
                            />
                          </td>
                          <td />
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="users__empty">
                          {t('users.empty')}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((u) => (
                        <tr
                          key={u.id}
                          className={
                            u.isActive === false ? 'users__row--archived' : ''
                          }
                        >
                          <td>
                            <button
                              className="user-link"
                              onClick={() =>
                                navigate(`/app/settings?userId=${u.id}`)
                              }
                            >
                              <div className="user-link__avatar">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.firstName} />
                                ) : (
                                  getInitials(u)
                                )}
                              </div>
                              <span className="user-link__name">
                                {getDisplayName(u)}
                              </span>
                            </button>
                          </td>
                          <td className="users__email">{u.email || '—'}</td>
                          <td className="users__org">
                            {u.organization || '—'}
                          </td>
                          <td>
                            <div className="users__role-cell">
                              <Badge size="md" tone={roleTone(u.role)}>
                                {u.role === 'user'
                                  ? t('userRoles.user')
                                  : (ROLE_LABEL[u.role ?? ''] ?? u.role)}
                              </Badge>
                              {isSuperAdmin && u.isDemo && (
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
                            <Badge tone={u.isActive === false ? 'neutral' : 'success'}>
                              {u.isActive === false ? 'Archivado' : 'Activo'}
                            </Badge>
                          </td>
                          <td>
                            <DropdownMenu items={buildMenuItems(u)} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
