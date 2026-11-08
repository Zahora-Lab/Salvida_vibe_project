import { useTranslation } from 'react-i18next';
import { Button, type ButtonTone } from '@/components/ui/button';
import type { Address } from '@/types';
import './AccessibilityChoice.css';

type Accessible = Address['is_accessible'];

interface AccessibilityChoiceProps {
  value: Accessible;
  onChange: (next: Accessible) => void;
}

const TONE: Record<string, ButtonTone> = { null: 'neutral', true: 'success', false: 'danger' };

/** Three-state picker for an address: pending, accessible or not accessible. */
export default function AccessibilityChoice({ value, onChange }: AccessibilityChoiceProps) {
  const { t } = useTranslation();
  const current = value ?? null;

  const options: { value: Accessible; label: string }[] = [
    { value: null, label: t('addresses.access.pendingShort') },
    { value: true, label: t('addresses.access.yesShort') },
    { value: false, label: t('addresses.access.noShort') },
  ];

  return (
    <div className="access-choice">
      <span className="access-choice__title">{t('addresses.columns.accessibility')}</span>
      <div className="access-choice__options">
        {options.map((option) => {
          const active = current === option.value;
          return (
            <Button
              key={String(option.value)}
              size="xs"
              variant={active ? 'soft' : 'outline'}
              tone={active ? TONE[String(option.value)] : 'neutral'}
              className="access-choice__option"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
