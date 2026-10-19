import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Plus, FlaskConical } from 'lucide-react';
import Header from '../../components/Header/Header';
import DropdownMenu from '../../components/DropdownMenu';
import type { DropdownItem } from '../../components/DropdownMenu';
import MobileAddButton from '../../components/MobileAddButton/MobileAddButton';
import { useUsers, useArchiveUser, useToggleUserDemo, useProfile } from '../../hooks/useProfile';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import CreateUserModal from './CreateUserModal';
import UserCard from './UserCard';
import { ROLE_LABEL, getDisplayName, getInitials } from './userDisplay';
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
  const [statusTab, setStatusTab] = useState<'active' | 'all' | 'archived'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  function buildMenuItems(u: UserProfile): DropdownItem[] {
    return [
      {
        label: u.isActive === false ? t('users.menu.restore') : t('users.menu.archive'),
        onClick: () => archiveUser.mutate(u.id),
        variant: u.isActive === false ? 'default' : 'danger',
      },
      ...(isSuperAdmin ? [{
        label: u.isDemo ? 'Quitar demo' : 'Marcar como demo',
        onClick: () => toggleDemo.mutate({ userId: u.id, isDemo: !u.isDemo }),
        variant: 'default' as const,
      }] : []),
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

      {showCreateModal && <CreateUserModal onClose={() => setShowCreateModal(false)} />}

      <div className="users__body">
        <div className="users__inner">

          <div className="users__toolbar">
            <div className="users__search-wrap">
              <span className="users__search-icon">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre, email u organización…"
                className="users__search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              className="users__create-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              <span>{t('users.newUser')}</span>
            </button>
          </div>

          <div className="users__filters-row">
            <div className="users__filter-tabs">
              {(['all', 'active', 'archived'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`users__filter-tab${statusTab === tab ? ' users__filter-tab--active' : ''}`}
                  onClick={() => setStatusTab(tab)}
                >
                  {tab === 'active' ? 'Activos' : tab === 'archived' ? 'Archivados' : 'Todos'}
                </button>
              ))}
            </div>
            <MobileAddButton label={t('users.newUser')} onClick={() => setShowCreateModal(true)} />
          </div>

          {/* Mobile: one card per user, every value labelled with its column title */}
          {isMobile && (
            isLoading ? (
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
              <p className="users__empty users__empty--card">{t('users.empty')}</p>
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
            )
          )}

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
                        <td><div className="users__skeleton" style={{ width: '180px' }} /></td>
                        <td><div className="users__skeleton" style={{ width: '160px' }} /></td>
                        <td><div className="users__skeleton" style={{ width: '120px' }} /></td>
                        <td><div className="users__skeleton" style={{ width: '60px' }} /></td>
                        <td><div className="users__skeleton" style={{ width: '70px' }} /></td>
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
                        className={u.isActive === false ? 'users__row--archived' : ''}
                      >
                        <td>
                          <button
                            className="user-link"
                            onClick={() => navigate(`/app/settings?userId=${u.id}`)}
                          >
                            <div className="user-link__avatar">
                              {u.avatar
                                ? <img src={u.avatar} alt={u.firstName} />
                                : getInitials(u)}
                            </div>
                            <span className="user-link__name">{getDisplayName(u)}</span>
                          </button>
                        </td>
                        <td className="users__email">{u.email || '—'}</td>
                        <td className="users__org">{u.organization || '—'}</td>
                        <td>
                          <div className="users__role-cell">
                            <span className={`user-role-badge user-role-badge--${u.role}`}>
                              {u.role === 'user' ? t('userRoles.user') : (ROLE_LABEL[u.role ?? ''] ?? u.role)}
                            </span>
                            {isSuperAdmin && u.isDemo && (
                              <span className="user-demo-badge" title={t('users.demo')}>
                                <FlaskConical size={12} />
                                demo
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`user-status-badge${u.isActive === false ? ' user-status-badge--archived' : ' user-status-badge--active'}`}>
                            {u.isActive === false ? 'Archivado' : 'Activo'}
                          </span>
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
