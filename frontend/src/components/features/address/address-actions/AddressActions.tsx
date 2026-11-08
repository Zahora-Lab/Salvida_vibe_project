import { Check, X, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { Address } from '@/types';

interface AddressActionsProps {
  address: Address;
  onAssess: (address: Address, isAccessible: boolean | null) => void;
  /** Icon size; the map popup is narrower and uses a smaller one. */
  iconSize?: number;
  className?: string;
}

/** Mark an address as accessible / not accessible, or send it back to pending. */
export default function AddressActions({
  address,
  onAssess,
  iconSize = 14,
  className,
}: AddressActionsProps) {
  const { t } = useTranslation();
  const classes = ['addresses__action-group', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {address.is_accessible !== true && (
        <Button
          variant="soft"
          tone="success"
          size="xs"
          icon={<Check size={iconSize} />}
          onClick={() => onAssess(address, true)}
          title={t('addresses.actions.markAccessible')}
        >
          {t('addresses.actions.markAccessible')}
        </Button>
      )}
      {address.is_accessible !== false && (
        <Button
          variant="soft"
          tone="danger"
          size="xs"
          icon={<X size={iconSize} />}
          onClick={() => onAssess(address, false)}
          title={t('addresses.actions.markNotAccessible')}
        >
          {t('addresses.actions.markNotAccessible')}
        </Button>
      )}
      {address.is_accessible !== null && (
        <Button
          variant="soft"
          size="xs"
          icon={<RotateCcw size={iconSize} />}
          onClick={() => onAssess(address, null)}
          title={t('addresses.actions.resetPending')}
        >
          {t('addresses.actions.resetPending')}
        </Button>
      )}
    </div>
  );
}
