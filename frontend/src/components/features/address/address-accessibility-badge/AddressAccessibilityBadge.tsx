import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { Address } from '@/types';

interface Props {
  value: Address['is_accessible'];
  className?: string;
}

export default function AddressAccessibilityBadge({ value, className }: Props) {
  const { t } = useTranslation();

  if (value === null || value === undefined) {
    return (
      <Badge tone="neutral" className={className}>
        {t('addresses.access.pending')}
      </Badge>
    );
  }

  if (value) {
    return (
      <Badge tone="success" className={className}>
        ♿ {t('addresses.access.yes')}
      </Badge>
    );
  }

  return (
    <Badge tone="danger" className={className}>
      {t('addresses.access.no')}
    </Badge>
  );
}
