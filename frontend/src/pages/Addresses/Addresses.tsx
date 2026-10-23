import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronDown, ChevronUp, List, Map, User } from 'lucide-react';
import Header from '../../components/layout/header/Header';
import { useAddresses, useValidateAddress } from '../../hooks/useAddresses';
import type { AccessibilityFilter } from '../../hooks/useAddresses';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { Address } from '../../types';
import AddressActions from '@/components/features/address/address-actions/AddressActions';
import AddressCard from '@/components/features/address/address-card/AddressCard';
import AddressMapPreview from '@/components/features/address/address-map-preview/AddressMapPreview';
import AddressesMapView from '@/components/features/address/addresses-map-view/AddressesMapView';
import UserMultiSelect from '../../components/features/user/user-multi-select/UserMultiSelect';
import PrmMultiSelect from '../../components/features/prm/prm-multi-select/PrmMultiSelect';
import AddressAccessibilityBadge from '../../components/features/address/address-accessibility-badge/AddressAccessibilityBadge';
import { IconButton } from '../../components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import './Addresses.css';

type ViewMode = 'list' | 'map';

export default function Addresses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filter, setFilter]           = useState<AccessibilityFilter | 'all'>('all');
  const [viewMode, setViewMode]       = useState<ViewMode>('list');
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [ownerIds, setOwnerIds]       = useState<string[]>([]);
  const [prmIds, setPrmIds]           = useState<string[]>([]);

  // When user selection changes, reset PRM filter
  function handleOwnerChange(ids: string[]) {
    setOwnerIds(ids);
    setPrmIds([]);
  }

  // Hint: only narrow PRM list when exactly 1 user is selected
  const singleOwnerId = ownerIds.length === 1 ? ownerIds[0] : undefined;

  const accessibility = filter === 'all' ? undefined : filter;
  const { data: addresses = [], isLoading } = useAddresses({
    accessibility,
    ownerIds,
    prmIds,
  });
  const validateAddress = useValidateAddress();
  const showCards = isMobile && !isLoading && addresses.length > 0;

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  function handleAssess(address: Address, is_accessible: boolean | null) {
    validateAddress.mutate({ id: address.id, is_accessible });
  }

  const accessFilters: { key: AccessibilityFilter | 'all'; label: string }[] = [
    { key: 'all',            label: t('addresses.filterAll') },
    { key: 'pending',        label: t('addresses.filterPending') },
    { key: 'accessible',     label: t('addresses.filterAccessible') },
    { key: 'not_accessible', label: t('addresses.filterNotAccessible') },
  ];

  return (
    <div className="addresses">
      <Header
        title={t('addresses.title')}
        subtitle={t('addresses.subtitle')}
      />

      <div className="addresses__body">
        <div className="addresses__inner">

          {/* Toolbar: filters + view toggle */}
          <div className="addresses__toolbar">
            <div className="addresses__filter-bar">
              {accessFilters.map(({ key, label }) => (
                <button
                  key={key}
                  className={`addresses__filter-btn${filter === key ? ' addresses__filter-btn--active' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="addresses__view-toggle">
              <button
                className={`addresses__view-btn${viewMode === 'list' ? ' addresses__view-btn--active' : ''}`}
                onClick={() => setViewMode('list')}
                title={t('addresses.viewList')}
              >
                <List size={16} />
              </button>
              <button
                className={`addresses__view-btn${viewMode === 'map' ? ' addresses__view-btn--active' : ''}`}
                onClick={() => setViewMode('map')}
                title={t('addresses.viewMap')}
              >
                <Map size={16} />
              </button>
            </div>
          </div>

          {/* Entity filters: user + PRM */}
          <div className="addresses__entity-filters">
            <div className="addresses__entity-filter">
              <label className="addresses__entity-filter__label">
                {t('addresses.filters.user')}
              </label>
              <UserMultiSelect
                values={ownerIds}
                onChange={handleOwnerChange}
                placeholder={t('addresses.filters.allUsers')}
              />
            </div>
            <div className="addresses__entity-filter">
              <label className="addresses__entity-filter__label">
                {t('addresses.filters.prm')}
              </label>
              <PrmMultiSelect
                values={prmIds}
                onChange={setPrmIds}
                ownerId={singleOwnerId}
                placeholder={t('addresses.filters.allPrms')}
              />
            </div>
          </div>

          {/* Map view */}
          {viewMode === 'map' && (
            <AddressesMapView
              addresses={addresses}
              onAssess={handleAssess}
            />
          )}

          {/* List view — cards on mobile, table on larger screens.
              Loading and empty states keep the shared wrapper in both. */}
          {viewMode === 'list' && showCards && (
            <ul className="addresses__cards">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  expanded={expandedId === address.id}
                  onToggleExpand={toggleExpand}
                  onAssess={handleAssess}
                  onOpenPrm={(prmId) => navigate(`/app/prms/${prmId}`)}
                />
              ))}
            </ul>
          )}

          {viewMode === 'list' && !showCards && (
            <div className="addresses__table-wrap">
              {isLoading ? (
                <div className="addresses__loading">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="addresses__skeleton-row">
                      <Skeleton width="60%" />
                      <Skeleton width="5rem" />
                      <Skeleton width="8rem" />
                    </div>
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <div className="addresses__empty">
                  <MapPin size={32} />
                  <p>{t('addresses.empty')}</p>
                </div>
              ) : (
                <table className="addresses__table">
                  <thead>
                    <tr>
                      <th>{t('addresses.columns.address')}</th>
                      <th>{t('addresses.columns.accessibility')}</th>
                      <th>{t('addresses.columns.actions')}</th>
                      <th />
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {addresses.map((address) => (
                      <React.Fragment key={address.id}>
                        <tr className="addresses__row">
                          <td className="addresses__address-cell">
                            <MapPin size={14} className="addresses__pin-icon" />
                            <div>
                              {address.alias && (
                                <span className="addresses__alias">{address.alias}</span>
                              )}
                              <span>{address.full_address}</span>
                            </div>
                          </td>
                          <td>
                            <AddressAccessibilityBadge value={address.is_accessible} />
                          </td>
                          <td>
                            <AddressActions address={address} onAssess={handleAssess} />
                          </td>
                          <td>
                            {address.lat && address.lng && (
                              <IconButton
                                className="addresses__expand-btn"
                                label={t('addresses.viewMap')}
                                icon={expandedId === address.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                tone="primary"
                                aria-expanded={expandedId === address.id}
                                onClick={() => toggleExpand(address.id)}
                              />
                            )}
                          </td>
                          <td>
                            {address.prm_id && (
                              <IconButton
                                className="addresses__expand-btn"
                                label={address.prm_name ? t('addresses.viewPrmProfile', { name: address.prm_name }) : t('addresses.viewPrmProfileGeneric')}
                                icon={<User size={15} />}
                                tone="primary"
                                onClick={() => navigate(`/app/prms/${address.prm_id}`)}
                              />
                            )}
                          </td>
                        </tr>
                        {expandedId === address.id && address.lat && address.lng && (
                          <tr className="addresses__map-row">
                            <td colSpan={5}>
                              <div className="addresses__map-preview">
                                <AddressMapPreview lat={address.lat} lng={address.lng} height="180px" />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
