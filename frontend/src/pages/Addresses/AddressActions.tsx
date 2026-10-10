import { Check, X, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Address } from '../../types';

interface AddressActionsProps {
  address: Address;
  onAssess: (address: Address, isAccessible: boolean | null) => void;
}

export default function AddressActions({ address, onAssess }: AddressActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="addresses__action-group">
      {address.is_accessible !== true && (
        <button
          className="addresses__action-btn addresses__action-btn--validate"
          onClick={() => onAssess(address, true)}
          title={t('addresses.actions.markAccessible')}
        >
          <Check size={14} />
          {t('addresses.actions.markAccessible')}
        </button>
      )}
      {address.is_accessible !== false && (
        <button
          className="addresses__action-btn addresses__action-btn--reject"
          onClick={() => onAssess(address, false)}
          title={t('addresses.actions.markNotAccessible')}
        >
          <X size={14} />
          {t('addresses.actions.markNotAccessible')}
        </button>
      )}
      {address.is_accessible !== null && (
        <button
          className="addresses__action-btn addresses__action-btn--reset"
          onClick={() => onAssess(address, null)}
          title={t('addresses.actions.resetPending')}
        >
          <RotateCcw size={14} />
          {t('addresses.actions.resetPending')}
        </button>
      )}
    </div>
  );
}
