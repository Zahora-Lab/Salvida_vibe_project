import { MapPin, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AddressAccessibilityBadge from '../../components/AddressAccessibilityBadge/AddressAccessibilityBadge';
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
  const prmLabel = prmName ? `Ver perfil de ${prmName}` : 'Ver perfil del PMR';

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
            <button
              className="addresses__expand-btn"
              onClick={() => onToggleExpand(address.id)}
              aria-expanded={expanded}
              aria-label={t('addresses.viewMap')}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
          {prmId && (
            <button
              className="addresses__expand-btn addresses__prm-link"
              onClick={() => onOpenPrm(prmId)}
              title={prmLabel}
              aria-label={prmLabel}
            >
              <User size={18} />
            </button>
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
