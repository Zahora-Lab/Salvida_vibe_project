import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  Cake,
  BookOpen,
  X,
  Check,
  MapPin,
  Plus,
  Trash2,
  Pencil,
  PowerOff,
  Power,
  Camera,
  User,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePrm, useUpdatePrm, useAddEmergencyContact, useDeleteEmergencyContact, useUpdateEmergencyContact } from '../../hooks/usePrms';
import DropdownMenu from '../../components/ui/dropdown-menu/DropdownMenu';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-toastify';
import {
  usePrmAddresses,
  useAddPrmAddress,
  useDeletePrmAddress,
  useUpdatePrmAddress,
} from '../../hooks/usePrmAddresses';
import AddressSelector from '../../components/features/address/address-selector/AddressSelector';
import PrmAddressesMap from '../../components/features/prm/prm-addresses-map/PrmAddressesMap';
import AddressAccessibilityBadge from '../../components/features/address/address-accessibility-badge/AddressAccessibilityBadge';
import DateInput from '../../components/ui/date-input/DateInput';
import type { Address } from '../../types';
import PrmRecentHistory from '@/components/features/prm/prm-recent-history/PrmRecentHistory';
import { Input } from '../../components/ui/input';
import { Button, BackButton, IconButton } from '../../components/ui/button';
import AccessibilityChoice from '../../components/features/address/accessibility-choice/AccessibilityChoice';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import './PrmDetail.css';

function formatBirthDate(iso: string) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export default function PrmDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: prm, isLoading, isError } = usePrm(id!);
  const updatePrm = useUpdatePrm();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  const { data: addresses, isLoading: addrLoading } = usePrmAddresses(id!);
  const defaultCenter: [number, number] | undefined =
    prm?.owner_default_lat != null && prm?.owner_default_lng != null
      ? [prm.owner_default_lat, prm.owner_default_lng]
      : undefined;
  const addPrmAddress = useAddPrmAddress();
  const deletePrmAddress = useDeletePrmAddress();
  const updatePrmAddress = useUpdatePrmAddress();
  const addEmergencyContact = useAddEmergencyContact();
  const deleteEmergencyContact = useDeleteEmergencyContact();
  const updateEmergencyContact = useUpdateEmergencyContact();

  // Emergency contact state
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContactDraft, setEditContactDraft] = useState({ name: '', phone: '', relationship: '' });

  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handleAvatarFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error(t('prmDetail.toast.imageFormat'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('prmDetail.toast.imageSize'));
      return;
    }
    if (!prm) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `prm-${prm.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      updatePrm.mutate({ id: prm.id, avatar: urlData.publicUrl });
    } catch {
      toast.error(t('prmDetail.toast.uploadError'));
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Address state
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddrValue, setNewAddrValue] = useState<Partial<Address>>({});
  const [newAddrAlias, setNewAddrAlias] = useState('');
  const [newAddrIsAccessible, setNewAddrIsAccessible] = useState<boolean | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddrDraft, setEditAddrDraft] = useState<{ value: Partial<Address>; alias: string }>({ value: {}, alias: '' });
  const [confirmDeleteAddrId, setConfirmDeleteAddrId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  // Initialize draft from PRM data. If PRM changes after mount (rare in detail view),
  // startEditing() can be called again to re-sync.
  const [draft, setDraft] = useState(() =>
    prm
      ? {
          name: prm.name,
          email: prm.email,
          phone: prm.phone,
          birthDate: prm.birthDate,
          dni: prm.dni || '',
          bloodType: prm.bloodType,
          height: prm.height ?? '',
          weight: prm.weight ?? '',
        }
      : {
          name: '',
          email: '',
          phone: '',
          birthDate: '',
          dni: '',
          bloodType: '',
          height: '' as string | number,
          weight: '' as string | number,
        },
  );

  function startEditing() {
    if (prm) {
      setDraft({
        name: prm.name,
        email: prm.email,
        phone: prm.phone,
        birthDate: prm.birthDate,
        dni: prm.dni || '',
        bloodType: prm.bloodType,
        height: prm.height ?? '',
        weight: prm.weight ?? '',
      });
      setEditing(true);
    }
  }

  async function handleSave() {
    if (!prm) return;
    try {
      await updatePrm.mutateAsync({
        id: prm.id,
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        birthDate: draft.birthDate,
        dni: draft.dni || undefined,
        bloodType: draft.bloodType,
        height: draft.height ? Number(draft.height) : undefined,
        weight: draft.weight ? Number(draft.weight) : undefined,
      });
      setEditing(false);
    } catch {
      // mutation error handled by TanStack Query
    }
  }

  if (isLoading) {
    return (
      <div className="prm-detail">
        <div className="prm-detail__header">
          <BackButton className="prm-detail__back-btn" onClick={() => navigate(-1)} />
          <h2 className="prm-detail__title">{t('prmDetail.title')}</h2>
        </div>
        <div className="prm-detail__body">
          <div className="prm-detail__inner">
            <div className="prm-detail__skeleton-profile" />
            <div className="prm-stats">
              {[0, 1, 2].map((i) => (
                <div key={i} className="prm-stat">
                  <div className="prm-detail__skeleton-line" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !prm) {
    return (
      <div className="prm-detail">
        <div className="prm-detail__header">
          <BackButton className="prm-detail__back-btn" onClick={() => navigate(-1)} />
          <h2 className="prm-detail__title">{t('prmDetail.title')}</h2>
        </div>
        <div className="prm-detail__body">
          <div className="prm-detail__inner prm-detail__not-found">
            <p>{t('prmDetail.notFound')}</p>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              {t('prmDetail.goBack')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prm-detail">
      <div className="prm-detail__header">
        <BackButton className="prm-detail__back-btn" onClick={() => navigate(-1)} />
        <h2 className="prm-detail__title">{t('prmDetail.title')}</h2>
        {isAdmin && prm && (
          <DropdownMenu
            items={[
              prm.status === 'Activo'
                ? {
                    label: t('prmDetail.menu.archive'),
                    icon: <PowerOff size={14} />,
                    onClick: () => updatePrm.mutate({ id: prm.id, status: 'Inactivo' }),
                    variant: 'danger',
                  }
                : {
                    label: t('prmDetail.menu.restore'),
                    icon: <Power size={14} />,
                    onClick: () => updatePrm.mutate({ id: prm.id, status: 'Activo' }),
                  },
            ]}
          />
        )}
      </div>

      <div className="prm-detail__body">
        <div className="prm-detail__inner">
          {/* Profile Header */}
          <div className="prm-profile">
            <div className="prm-profile__avatar-wrap">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleAvatarFile(file);
                  event.target.value = '';
                }}
              />
              <img
                src={
                  prm.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(prm.name)}&background=random`
                }
                alt={prm.name}
                className="prm-profile__avatar"
              />
              <button
                type="button"
                className="prm-profile__avatar-btn"
                disabled={uploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                title={t('prmDetail.avatar.changePhoto')}
              >
                <Camera size={14} />
              </button>
            </div>
            <div>
              {editing ? (
                <Input
                  variant="compact"
                  size="xs"
                  className="prm-edit-input--name"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              ) : (
                <h1 className="prm-profile__name">{prm.name}</h1>
              )}
              <div className="prm-profile__badges">
                <Badge tone={prm.status === 'Activo' ? 'success' : 'neutral'}>
                  {prm.status === 'Activo' ? t('common.active') : t('common.archived')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="prm-stats">
            {editing ? (
              <>
                <div className="prm-stat">
                  <Select
                    variant="compact"
                    size="xs"
                    className="prm-edit-input--stat"
                    value={draft.bloodType}
                    onChange={(event) =>
                      setDraft({ ...draft, bloodType: event.target.value })
                    }
                  >
                    <option value="">—</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                      (g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ),
                    )}
                  </Select>
                  <p className="prm-stat__label">{t('prmDetail.blood')}</p>
                </div>
                <div className="prm-stat">
                  <Input
                    variant="compact"
                    size="xs"
                    className="prm-edit-input--stat"
                    type="text"
                    placeholder="cm"
                    value={draft.height}
                    onChange={(event) =>
                      setDraft({ ...draft, height: event.target.value })
                    }
                  />
                  <p className="prm-stat__label">{t('prmDetail.height')}</p>
                </div>
                <div className="prm-stat">
                  <Input
                    variant="compact"
                    size="xs"
                    className="prm-edit-input--stat"
                    type="text"
                    placeholder="kg"
                    value={draft.weight}
                    onChange={(event) =>
                      setDraft({ ...draft, weight: event.target.value })
                    }
                  />
                  <p className="prm-stat__label">{t('prmDetail.weight')}</p>
                </div>
              </>
            ) : (
              [
                { label: t('prmDetail.blood'), value: prm.bloodType },
                { label: t('prmDetail.height'), value: prm.height },
                { label: t('prmDetail.weight'), value: prm.weight },
              ].map((stat) => (
                <div key={stat.label} className="prm-stat">
                  <p className="prm-stat__value">{stat.value || '—'}</p>
                  <p className="prm-stat__label">{stat.label}</p>
                </div>
              ))
            )}
          </div>

          {/* Personal Info */}
          <div className="prm-info">
            <div className="prm-info__header">
              <h3 className="prm-info__title">{t('prmDetail.personalInfo')}</h3>
              {editing ? (
                <div className="prm-edit-actions">
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={<X size={16} />}
                    onClick={() => setEditing(false)}
                  >
                    {t('prmDetail.cancelEdit')}
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    icon={<Check size={16} />}
                    onClick={handleSave}
                    disabled={updatePrm.isPending}
                  >
                    {t('prmDetail.saveChanges')}
                  </Button>
                </div>
              ) : (
                <Button variant="link" size="sm" onClick={startEditing}>
                  {t('prmDetail.edit')}
                </Button>
              )}
            </div>
            <div className="prm-info__rows">
              <div className="prm-info__row">
                <div className="prm-info__row-left">
                  <div className="prm-info__row-icon">
                    <Mail size={16} />
                  </div>
                  <span className="prm-info__row-key">
                    {t('prmDetail.email')}
                  </span>
                </div>
                {editing ? (
                  <Input
                    variant="compact"
                    size="xs"
                    type="email"
                    value={draft.email}
                    onChange={(event) =>
                      setDraft({ ...draft, email: event.target.value })
                    }
                  />
                ) : (
                  <span className="prm-info__row-value">{prm.email}</span>
                )}
              </div>
              <div className="prm-info__row">
                <div className="prm-info__row-left">
                  <div className="prm-info__row-icon">
                    <Phone size={16} />
                  </div>
                  <span className="prm-info__row-key">
                    {t('prmDetail.phone')}
                  </span>
                </div>
                {editing ? (
                  <Input
                    variant="compact"
                    size="xs"
                    type="tel"
                    value={draft.phone}
                    onChange={(event) =>
                      setDraft({ ...draft, phone: event.target.value })
                    }
                  />
                ) : (
                  <span className="prm-info__row-value">{prm.phone}</span>
                )}
              </div>
              <div className="prm-info__row">
                <div className="prm-info__row-left">
                  <div className="prm-info__row-icon">
                    <Cake size={16} />
                  </div>
                  <span className="prm-info__row-key">
                    {t('prmDetail.birthdate')}
                  </span>
                </div>
                {editing ? (
                  <DateInput
                    value={draft.birthDate}
                    onChange={(v) => setDraft({ ...draft, birthDate: v })}
                    placeholder={t('prmDetail.birthdate')}
                  />
                ) : (
                  <span className="prm-info__row-value">
                    {formatBirthDate(prm.birthDate)}
                  </span>
                )}
              </div>
              <div className="prm-info__row">
                <div className="prm-info__row-left">
                  <div className="prm-info__row-icon">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      ID
                    </span>
                  </div>
                  <span className="prm-info__row-key">
                    {t('prmDetail.dni')}
                  </span>
                </div>
                {editing ? (
                  <Input
                    variant="compact"
                    size="xs"
                    type="text"
                    value={draft.dni}
                    onChange={(event) =>
                      setDraft({ ...draft, dni: event.target.value })
                    }
                  />
                ) : (
                  <span className="prm-info__row-value">{prm.dni || '—'}</span>
                )}
              </div>
              {isAdmin && (
                <div className="prm-info__row">
                  <div className="prm-info__row-left">
                    <div className="prm-info__row-icon">
                      <User size={16} />
                    </div>
                    <span className="prm-info__row-key">{t('prms.columns.responsible')}</span>
                  </div>
                  <span className="prm-info__row-value">{prm.owner_name || '—'}</span>
                </div>
              )}
            </div>
          </div>

            {/* Emergency Contacts */}
          <div className="prm-info">
            <div className="prm-info__header">
              <h3 className="prm-info__title">
                {t('prmDetail.emergencyContacts')}
              </h3>
              {!showAddContact && (
                <Button
                  variant="link"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => setShowAddContact(true)}
                >
                  {t('prmDetail.addContact')}
                </Button>
              )}
            </div>

            {prm.emergency_contacts && prm.emergency_contacts.length > 0 ? (
              <div className="prm-info__rows">
                {prm.emergency_contacts.map((contact) => (
                  editingContactId === contact.id ? (
                    <div key={contact.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', borderBottom: '1px solid var(--color-slate-50)' }}>
                      <Input variant="compact" size="xs" type="text" placeholder={t('prmDetail.contactName')} value={editContactDraft.name} onChange={(event) => setEditContactDraft({ ...editContactDraft, name: event.target.value })} style={{ maxWidth: '100%', width: '100%' }} />
                      <Input variant="compact" size="xs" type="tel" placeholder={t('prmDetail.contactPhone')} value={editContactDraft.phone} onChange={(event) => setEditContactDraft({ ...editContactDraft, phone: event.target.value })} style={{ maxWidth: '100%', width: '100%' }} />
                      <Input variant="compact" size="xs" type="text" placeholder={t('prmDetail.contactRelationshipPlaceholder')} value={editContactDraft.relationship} onChange={(event) => setEditContactDraft({ ...editContactDraft, relationship: event.target.value })} style={{ maxWidth: '100%', width: '100%' }} />
                      <div className="prm-edit-actions" style={{ justifyContent: 'flex-end' }}>
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={<X size={14} />}
                          type="button"
                          onClick={() => setEditingContactId(null)}
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          icon={<Check size={14} />}
                          type="button"
                          disabled={!editContactDraft.name.trim() || updateEmergencyContact.isPending}
                          onClick={async () => {
                            await updateEmergencyContact.mutateAsync({ prmId: id!, ecId: contact.id, ...editContactDraft });
                            setEditingContactId(null);
                          }}
                        >
                          {t('common.save')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div key={contact.id} className="prm-info__row">
                      <div className="prm-info__row-left">
                        <div className="prm-info__row-icon"><Phone size={16} /></div>
                        <div>
                          <span className="prm-info__row-key">{contact.name}</span>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginTop: '0.125rem' }}>{contact.relationship}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="prm-info__row-value">{contact.phone}</span>
                        <IconButton
                          label={t('common.edit')}
                          icon={<Pencil size={15} />}
                          tone="primary"
                          onClick={() => { setEditingContactId(contact.id); setEditContactDraft({ name: contact.name, phone: contact.phone, relationship: contact.relationship }); }}
                        />
                        <IconButton
                          label={t('common.remove')}
                          icon={<Trash2 size={15} />}
                          tone="danger"
                          onClick={() => deleteEmergencyContact.mutate({ prmId: id!, ecId: contact.id })}
                        />
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              !showAddContact && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-400)' }}>
                  {t('prmDetail.noEmergencyContacts')}
                </p>
              )
            )}

            {showAddContact && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--color-slate-100)' }}>
                <Input
                  variant="compact"
                  size="xs"
                  type="text"
                  placeholder={t('prmDetail.contactName')}
                  value={newContact.name}
                  onChange={(event) => setNewContact({ ...newContact, name: event.target.value })}
                  style={{ maxWidth: '100%', width: '100%' }}
                />
                <Input
                  variant="compact"
                  size="xs"
                  type="tel"
                  placeholder={t('prmDetail.contactPhone')}
                  value={newContact.phone}
                  onChange={(event) => setNewContact({ ...newContact, phone: event.target.value })}
                  style={{ maxWidth: '100%', width: '100%' }}
                />
                <Input
                  variant="compact"
                  size="xs"
                  type="text"
                  placeholder={t('prmDetail.contactRelationshipPlaceholder')}
                  value={newContact.relationship}
                  onChange={(event) => setNewContact({ ...newContact, relationship: event.target.value })}
                  style={{ maxWidth: '100%', width: '100%' }}
                />
                <div className="prm-edit-actions" style={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={<X size={14} />}
                    type="button"
                    onClick={() => { setShowAddContact(false); setNewContact({ name: '', phone: '', relationship: '' }); }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    icon={<Check size={14} />}
                    type="button"
                    disabled={!newContact.name.trim() || !newContact.phone.trim() || addEmergencyContact.isPending}
                    onClick={async () => {
                      await addEmergencyContact.mutateAsync({
                        prmId: id!,
                        name: newContact.name.trim(),
                        phone: newContact.phone.trim(),
                        relationship: newContact.relationship.trim(),
                      });
                      setShowAddContact(false);
                      setNewContact({ name: '', phone: '', relationship: '' });
                    }}
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Addresses */}
          <div className="prm-info">
            <div className="prm-info__header">
              <h3 className="prm-info__title">{t('prmDetail.addresses')}</h3>
              {!showAddAddr && (
                <Button
                  variant="link"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => setShowAddAddr(true)}
                >
                  {t('prmDetail.addAddress')}
                </Button>
              )}
            </div>

            {addrLoading ? (
              <div className="prm-detail__skeleton-line" />
            ) : (
              <>
                {addresses && addresses.length > 0 && (
                  <div className="prm-info__rows">
                    {addresses.map((addr) => (
                      editingAddressId === addr.id ? (
                        <div key={addr.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', borderBottom: '1px solid var(--color-slate-50)' }}>
                          <AddressSelector value={editAddrDraft.value} onChange={(v) => setEditAddrDraft({ ...editAddrDraft, value: v })} showValidation={false} showMap={false} />
                          <Input variant="compact" size="xs" type="text" placeholder={t('prmDetail.addressAlias')} value={editAddrDraft.alias} onChange={(event) => setEditAddrDraft({ ...editAddrDraft, alias: event.target.value })} maxLength={40} style={{ maxWidth: '100%', width: '100%' }} />
                          {isAdmin && (
                            <AccessibilityChoice
                              value={editAddrDraft.value.is_accessible ?? null}
                              onChange={(next) =>
                                setEditAddrDraft({ ...editAddrDraft, value: { ...editAddrDraft.value, is_accessible: next } })
                              }
                            />
                          )}
                          <div className="prm-edit-actions" style={{ justifyContent: 'flex-end' }}>
                            <Button
                              variant="ghost"
                              size="xs"
                              icon={<X size={14} />}
                              type="button"
                              onClick={() => setEditingAddressId(null)}
                            >
                              {t('common.cancel')}
                            </Button>
                            <Button
                              variant="primary"
                              size="xs"
                              icon={<Check size={14} />}
                              type="button"
                              disabled={!editAddrDraft.value.full_address || updatePrmAddress.isPending}
                              onClick={async () => {
                                await updatePrmAddress.mutateAsync({ prmId: id!, addressId: addr.id, full_address: editAddrDraft.value.full_address, lat: editAddrDraft.value.lat, lng: editAddrDraft.value.lng, is_accessible: editAddrDraft.value.is_accessible, alias: editAddrDraft.alias });
                                setEditingAddressId(null);
                              }}
                            >
                              {t('common.save')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div key={addr.id} className="prm-info__row">
                          <div className="prm-info__row-left">
                            <div className="prm-info__row-icon"><MapPin size={16} /></div>
                            <div>
                              {addr.alias && <span className="prm-info__row-key">{addr.alias}</span>}
                              <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)', marginTop: addr.alias ? '0.125rem' : 0 }}>{addr.full_address}</p>
                              <AddressAccessibilityBadge value={addr.is_accessible} className="prm-info__addr-badge" />
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {confirmDeleteAddrId === addr.id ? (
                              <>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', whiteSpace: 'nowrap' }}>
                                  {t('common.confirmDelete')}
                                </span>
                                <Button variant="ghost" size="xs" onClick={() => setConfirmDeleteAddrId(null)}>
                                  {t('common.cancel')}
                                </Button>
                                <Button
                                  variant="soft"
                                  tone="danger"
                                  size="xs"
                                  onClick={() => {
                                    deletePrmAddress.mutate({ prmId: id!, addressId: addr.id });
                                    setConfirmDeleteAddrId(null);
                                  }}
                                >
                                  {t('common.delete')}
                                </Button>
                              </>
                            ) : (
                              <>
                                <IconButton
                                  label={t('prmDetail.editAddress')}
                                  icon={<Pencil size={15} />}
                                  tone="primary"
                                  onClick={() => { setEditingAddressId(addr.id); setEditAddrDraft({ value: { full_address: addr.full_address, lat: addr.lat, lng: addr.lng, is_accessible: addr.is_accessible }, alias: addr.alias || '' }); }}
                                />
                                <IconButton
                                  label={t('prmDetail.deleteAddress')}
                                  icon={<Trash2 size={15} />}
                                  tone="danger"
                                  onClick={() => setConfirmDeleteAddrId(addr.id)}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}

                <PrmAddressesMap
                  addresses={
                    editingAddressId
                      ? (addresses ?? []).filter((a) => a.id !== editingAddressId)
                      : (addresses ?? [])
                  }
                  previewAddress={
                    showAddAddr
                      ? newAddrValue
                      : editingAddressId
                        ? editAddrDraft.value
                        : undefined
                  }
                  defaultCenter={defaultCenter}
                />

                {(!addresses || addresses.length === 0) && !showAddAddr && (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-slate-400)',
                    }}
                  >
                    {t('prmDetail.noAddresses')}
                  </p>
                )}

                {showAddAddr && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--color-slate-100)',
                    }}
                  >
                    <AddressSelector
                      value={newAddrValue}
                      onChange={setNewAddrValue}
                      showValidation={false}
                      showMap={false}
                    />
                    <Input
                      variant="compact"
                      size="xs"
                      type="text"
                      placeholder={t('prmDetail.addressAlias')}
                      value={newAddrAlias}
                      onChange={(e) => setNewAddrAlias(e.target.value)}
                      maxLength={40}
                      style={{ maxWidth: '100%', width: '100%' }}
                    />
                    {isAdmin && (
                      <AccessibilityChoice
                        value={newAddrIsAccessible}
                        onChange={setNewAddrIsAccessible}
                      />
                    )}
                    <div
                      className="prm-edit-actions"
                      style={{ justifyContent: 'flex-end' }}
                    >
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={<X size={14} />}
                        type="button"
                        onClick={() => {
                          setShowAddAddr(false);
                          setNewAddrValue({});
                          setNewAddrAlias('');
                          setNewAddrIsAccessible(null);
                        }}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        icon={<Check size={14} />}
                        type="button"
                        disabled={
                          !newAddrValue.full_address || addPrmAddress.isPending
                        }
                        onClick={async () => {
                          if (!newAddrValue.full_address) return;
                          await addPrmAddress.mutateAsync({
                            prmId: id!,
                            full_address: newAddrValue.full_address,
                            lat: newAddrValue.lat,
                            lng: newAddrValue.lng,
                            is_accessible: newAddrIsAccessible,
                            alias: newAddrAlias,
                          });
                          setShowAddAddr(false);
                          setNewAddrValue({});
                          setNewAddrAlias('');
                          setNewAddrIsAccessible(null);
                        }}
                      >
                        {t('common.save')}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <PrmRecentHistory />
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="booking-fab">
        <Link to="/app/bookings/new" className="booking-fab__btn">
          <BookOpen size={20} />
          <span>{t('prmDetail.bookAppointment')}</span>
        </Link>
      </div>
    </div>
  );
}
