import { Link } from 'react-router-dom';
import { Mail, Phone, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import type { DropdownItem } from '@/components/ui/dropdown-menu';
import type { PrmListItem } from '@/hooks/usePrms';
import { formatLastVisit } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

interface PrmCardProps {
  prm: PrmListItem;
  isAdmin: boolean;
  menuItems: DropdownItem[];
}

/** Mobile counterpart of a table row. Every value carries its column title. */
export default function PrmCard({ prm, isAdmin, menuItems }: PrmCardProps) {
  const { t } = useTranslation();
  const isActive = prm.status === 'Activo';

  return (
    <Card as="li" padding="md" className="prms__card">
      <div className="prms__card-head">
        <Link to={`/app/prms/${prm.id}`} className="prm-link prms__card-link">
          <Avatar>{prm.name.charAt(0)}</Avatar>
          <div className="prms__card-id">
            <span className="prm-link__name">{prm.name}</span>
            <Badge tone={isActive ? 'success' : 'neutral'}>
              {isActive ? t('common.active') : t('common.archived')}
            </Badge>
          </div>
        </Link>
        <DropdownMenu items={menuItems} />
      </div>

      <dl className="prms__card-fields">
        {isAdmin && (
          <div className="prms__card-field prms__card-field--full">
            <dt>{t('prms.columns.responsible')}</dt>
            <dd>
              {prm.owner_name ? (
                <span className="prms__card-owner">
                  <User size={12} />
                  {prm.owner_name}
                </span>
              ) : '—'}
            </dd>
          </div>
        )}

        <div className="prms__card-field prms__card-field--full">
          <dt>{t('prms.columns.contact')}</dt>
          <dd>
            {prm.email || prm.phone ? (
              <div className="prm-contact">
                {prm.email && (
                  <div className="prm-contact__item prms__card-contact-item">
                    <Mail size={12} />
                    <span>{prm.email}</span>
                  </div>
                )}
                {prm.phone && (
                  <div className="prm-contact__item prms__card-contact-item">
                    <Phone size={12} />
                    <span>{prm.phone}</span>
                  </div>
                )}
              </div>
            ) : '—'}
          </dd>
        </div>

        <div className="prms__card-field">
          <dt>{t('prms.columns.bookings')}</dt>
          <dd className="prms__card-count">{prm.booking_count ?? 0}</dd>
        </div>

        <div className="prms__card-field">
          <dt>{t('prms.columns.lastVisit')}</dt>
          <dd>{formatLastVisit(prm.last_booking_date)}</dd>
        </div>
      </dl>
    </Card>
  );
}
