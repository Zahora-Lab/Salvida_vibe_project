import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/layout/header/Header';
import { DropdownMenu } from '../../components/ui/dropdown-menu';
import { ListToolbar } from '../../components/ui/list-toolbar';
import { FilterTabs } from '../../components/ui/filter-tabs';
import { Badge } from '../../components/ui/badge';
import type { DropdownItem } from '../../components/ui/dropdown-menu';
import { usePrms, useUpdatePrm } from '../../hooks/usePrms';
import type { PrmListItem } from '../../hooks/usePrms';
import { useAuthStore } from '../../store/useAuthStore';
import { useDebounce } from '../../hooks/useDebounce';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { formatLastVisit } from '../../utils';
import PrmCard from '@/components/features/prm/prm-card/PrmCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';
import './Prms.css';

export default function Prms() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'Activo' | 'Inactivo'>('all');
  const debouncedQuery = useDebounce(query, 300);
  const { data: prms = [], isLoading } = usePrms(
    debouncedQuery,
    undefined,
    statusTab === 'all' ? undefined : statusTab,
  );
  const updatePrm = useUpdatePrm();
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin' || s.user?.role === 'superadmin');
  const isMobile = useMediaQuery('(max-width: 768px)');

  function buildMenuItems(prm: PrmListItem): DropdownItem[] {
    const isActive = prm.status === 'Activo';
    return [
      { label: t('prms.menu.viewProfile'), onClick: () => navigate(`/app/prms/${prm.id}`) },
      {
        label: isActive ? t('prms.menu.deactivate') : t('prms.menu.activate'),
        onClick: () => updatePrm.mutate({ id: prm.id, status: isActive ? 'Inactivo' : 'Activo' }),
        variant: isActive ? 'danger' : 'default',
      },
    ];
  }

  return (
    <div className="prms">
      <Header
        title={t('prms.title')}
        subtitle={t('prms.subtitle')}
      />

      <div className="prms__body">
        <div className="prms__inner">

          <ListToolbar
            search={{ value: query, onChange: setQuery, placeholder: t('prms.search') }}
            create={{ label: t('prms.addPrm'), to: '/app/prms/new' }}
            filters={
              <FilterTabs
                value={statusTab}
                onChange={setStatusTab}
                options={[
                  { value: 'all', label: t('prms.tabs.all') },
                  { value: 'Activo', label: t('prms.tabs.active') },
                  { value: 'Inactivo', label: t('prms.tabs.inactive') },
                ]}
              />
            }
          />

          {/* Mobile: one card per PMR, every value labelled with its column title */}
          {isMobile && (
            isLoading ? (
              <ul className="prms__cards" aria-busy="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card as="li" padding="md" key={i} className="prms__card prms__card--skeleton">
                    <Skeleton width="55%" />
                    <Skeleton width="80%" />
                    <Skeleton width="40%" />
                  </Card>
                ))}
              </ul>
            ) : prms.length === 0 ? (
              <EmptyState bordered>{t('prms.empty')}</EmptyState>
            ) : (
              <ul className="prms__cards">
                {prms.map((prm) => (
                  <PrmCard key={prm.id} prm={prm} isAdmin={isAdmin} menuItems={buildMenuItems(prm)} />
                ))}
              </ul>
            )
          )}

          {!isMobile && (
          <Card clip>
            <div className="prms__table-scroll">
              <table className="prms__table">
                <thead>
                  <tr>
                    <th>{t('prms.columns.name')}</th>
                    {isAdmin && <th>{t('prms.columns.responsible')}</th>}
                    <th>{t('prms.columns.contact')}</th>
                    <th className="center">{t('prms.columns.bookings')}</th>
                    <th>{t('prms.columns.lastVisit')}</th>
                    <th>{t('prms.columns.status')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="prms__skeleton-row">
                        <td><Skeleton width="180px" /></td>
                        {isAdmin && <td><Skeleton width="120px" /></td>}
                        <td><Skeleton width="140px" /></td>
                        <td><Skeleton width="40px" style={{ margin: '0 auto' }} /></td>
                        <td><Skeleton width="80px" /></td>
                        <td><Skeleton width="60px" /></td>
                        <td />
                      </tr>
                    ))
                  ) : prms.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="prms__empty-cell">
                        <EmptyState>{t('prms.empty')}</EmptyState>
                      </td>
                    </tr>
                  ) : (
                    prms.map((prm) => (
                      <tr key={prm.id}>
                        <td>
                          <Link to={`/app/prms/${prm.id}`} className="prm-link">
                            <Avatar>{prm.name.charAt(0)}</Avatar>
                            <span className="prm-link__name">{prm.name}</span>
                          </Link>
                        </td>
                        {isAdmin && (
                          <td className="prm-owner">
                            {prm.owner_name ? (
                              <div className="prm-owner__wrap">
                                <User size={12} />
                                <span>{prm.owner_name}</span>
                              </div>
                            ) : '—'}
                          </td>
                        )}
                        <td>
                          <div className="prm-contact">
                            <div className="prm-contact__item">
                              <Mail size={12} />
                              <span>{prm.email}</span>
                            </div>
                            <div className="prm-contact__item">
                              <Phone size={12} />
                              <span>{prm.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="prm-bookings">
                          {prm.booking_count ?? 0}
                        </td>
                        <td className="prm-date">
                          {formatLastVisit(prm.last_booking_date)}
                        </td>
                        <td>
                          <Badge tone={prm.status === 'Activo' ? 'success' : 'neutral'}>
                            {prm.status === 'Activo' ? t('common.active') : t('common.archived')}
                          </Badge>
                        </td>
                        <td>
                          <DropdownMenu items={buildMenuItems(prm)} />
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
