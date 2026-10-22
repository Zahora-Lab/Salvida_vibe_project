import { MapPin, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AddressAccessibilityBadge from '../../components/features/address/address-accessibility-badge/AddressAccessibilityBadge';
import { IconButton } from '../../components/ui/button';
import type { Address } from '../../types';
import AddressActions from './AddressActions';
import AddressMapPreview from './AddressMapPreview';

interface AddressCardProps {
  address: Address;
  expanded: boolean;
  onToggleExpand: (id: string) => void;
  onAssess: (address: Address, isAccessible: boolean | null) => void;
  onOpenPrm: (prmId: string) => void;
}

/** Mobile counterpart of a table row: address / accessibility / actions. */
export default function AddressCard({
  address,
  expanded,
  onToggleExpand,
  onAssess,
  onOpenPrm,
}: AddressCardProps) {
  const { t } = useTranslation();
  const { lat, lng, prm_id: prmId, prm_name: prmName } = address;
  const hasCoords = lat != null && lng != null;
  const prmLabel = prmName ? t('addresses.viewPrmProfile', { name: prmName }) : t('addresses.viewPrmProfileGeneric');

  return (
    <li className="addresses__card">
      <div className="addresses__card-row addresses__card-row--address">
        <MapPin size={14} className="addresses__pin-icon" />
        <div
          className="addresses__card-address"
          title={[address.alias, address.full_address].filter(Boolean).join(' · ')}
        >
          {address.alias && <span className="addresses__alias">{address.alias}</span>}
          <span>{address.full_address}</span>
        </div>
      </div>

      <div className="addresses__card-row addresses__card-row--status">
        <AddressAccessibilityBadge value={address.is_accessible} />
        <div className="addresses__card-icons">
          {hasCoords && (
            <IconButton
              className="addresses__expand-btn"
              label={t('addresses.viewMap')}
              icon={expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              tone="primary"
              aria-expanded={expanded}
              onClick={() => onToggleExpand(address.id)}
            />
          )}
          {prmId && (
            <IconButton
              className="addresses__expand-btn"
              label={prmLabel}
              icon={<User size={18} />}
              tone="primary"
              onClick={() => onOpenPrm(prmId)}
            />
          )}
        </div>
      </div>

      {/* Right under the row that holds its trigger, above the actions */}
      {expanded && lat != null && lng != null && (
        <div className="addresses__map-preview">
          <AddressMapPreview lat={lat} lng={lng} height="180px" />
        </div>
      )}

      <div className="addresses__card-row addresses__card-row--actions">
        <AddressActions address={address} onAssess={onAssess} />
      </div>
    </li>
  );
}
