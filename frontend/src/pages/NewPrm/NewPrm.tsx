import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCreatePrm } from '../../hooks/usePrms';
import { useAddPrmAddress } from '../../hooks/usePrmAddresses';
import AddressSelector from '../../components/features/address/address-selector/AddressSelector';
import UserSelector from '../../components/features/user/user-selector/UserSelector';
import { useAuthStore } from '../../store/useAuthStore';
import { DateInput } from '../../components/ui/date-input';
import type { Address } from '../../types';
import { Input } from '../../components/ui/input';
import { FormField } from '../../components/ui/form-field';
import { BackButton, Button, IconButton } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import './NewPrm.css';

interface ContactDraft {
  name: string;
  phone: string;
  relationship: string;
}

export default function NewPrm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createPrm = useCreatePrm();
  const addPrmAddress = useAddPrmAddress();
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin' || s.user?.role === 'superadmin');

  // Admin: selected owner
  const [ownerId, setOwnerId] = useState('');

  // Basic fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dni, setDni] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [status, setStatus] = useState<'Activo' | 'Inactivo'>('Activo');

  // Medical fields
  const [bloodType, setBloodType] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Contacts
  const [contacts, setContacts] = useState<ContactDraft[]>([]);

  // Addresses
  const [addressDrafts, setAddressDrafts] = useState<{ value: Partial<Address>; alias: string }[]>([]);

  // Errors
  const [nameError, setNameError] = useState('');
  const [formError, setFormError] = useState('');

  function addContact() {
    if (contacts.length >= 2) return;
    setContacts([...contacts, { name: '', phone: '', relationship: '' }]);
  }

  function updateContact(index: number, field: keyof ContactDraft, value: string) {
    setContacts(contacts.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function removeContact(index: number) {
    setContacts(contacts.filter((_, i) => i !== index));
  }

  function addAddressDraft() {
    setAddressDrafts([...addressDrafts, { value: {}, alias: '' }]);
  }

  function updateAddressDraftValue(index: number, value: Partial<Address>) {
    setAddressDrafts(addressDrafts.map((d, i) => (i === index ? { ...d, value } : d)));
  }

  function updateAddressDraftAlias(index: number, alias: string) {
    setAddressDrafts(addressDrafts.map((d, i) => (i === index ? { ...d, alias } : d)));
  }

  function removeAddressDraft(index: number) {
    setAddressDrafts(addressDrafts.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setNameError('');
    setFormError('');

    if (!name.trim()) {
      setNameError(t('prms.newPrm.errorRequired'));
      return;
    }

    const emergencyContacts = contacts.filter((c) => c.name.trim());

    try {
      const newPrm = await createPrm.mutateAsync({
        name: name.trim(),
        email,
        phone,
        dni,
        birthDate,
        status,
        bloodType,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        avatar: undefined,
        emergency_contacts: emergencyContacts,
        is_demo: false,
        ...(isAdmin && ownerId ? { owner_id: ownerId } : {}),
      } as Parameters<typeof createPrm.mutateAsync>[0]);

      for (const draft of addressDrafts.filter((d) => d.value.full_address)) {
        await addPrmAddress.mutateAsync({
          prmId: newPrm.id,
          full_address: draft.value.full_address!,
          lat: draft.value.lat,
          lng: draft.value.lng,
          is_accessible: draft.value.is_accessible ?? false,
          alias: draft.alias,
        });
      }

      navigate(`/app/prms/${newPrm.id}`);
    } catch {
      setFormError(t('prms.newPrm.errorGeneric'));
    }
  }

  return (
    <div className="new-prm">
      <div className="new-prm__header">
        <BackButton to="/app/prms" />
        <div>
          <h1 className="new-prm__title">{t('prms.newPrm.title')}</h1>
          <p className="new-prm__subtitle">{t('prms.newPrm.subtitle')}</p>
        </div>
      </div>

      <div className="new-prm__body">
        <form className="new-prm__form" onSubmit={handleSubmit} noValidate>

          {/* Section: Responsable (admin only) */}
          {isAdmin && (
            <section className="new-prm__section">
              <h2 className="new-prm__section-title">{t('prms.newPrm.sections.responsible')}</h2>
              <UserSelector
                value={ownerId}
                label=""
                placeholder={t('prms.newPrm.responsiblePlaceholder')}
                onChange={(id) => setOwnerId(id)}
                onClear={() => setOwnerId('')}
              />
              {!ownerId && (
                <p className="new-prm__owner-hint">{t('prms.newPrm.responsibleHint')}</p>
              )}
            </section>
          )}

          {/* Section: Información básica */}
          <section className="new-prm__section">
            <h2 className="new-prm__section-title">
              {t('prms.newPrm.sections.basic')}
            </h2>
            <div className="new-prm__grid">
              <FormField
                className="new-prm__field--full"
                label={t('prms.newPrm.nameFull')}
                htmlFor="name"
                required
                error={nameError}
              >
                {(field) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('prms.newPrm.namePlaceholder')}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameError(''); }}
                  />
                )}
              </FormField>

              <FormField label={t('prms.newPrm.email')} htmlFor="email">
                {(field) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder={t('prms.newPrm.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                )}
              </FormField>

              <FormField label={t('prms.newPrm.phone')} htmlFor="phone">
                {(field) => (
                  <Input
                    {...field}
                    type="tel"
                    placeholder={t('prms.newPrm.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                )}
              </FormField>

              <FormField label={t('prms.newPrm.dni')} htmlFor="dni">
                {(field) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('prms.newPrm.dniPlaceholder')}
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                  />
                )}
              </FormField>

              <FormField label={t('prms.newPrm.birthDate')} htmlFor="birthDate">
                <DateInput
                  id="birthDate"
                  value={birthDate}
                  onChange={setBirthDate}
                  placeholder={t('prms.newPrm.birthDate')}
                />
              </FormField>

              <FormField label={t('prms.newPrm.status')} htmlFor="status">
                {(field) => (
                  <Select
                    {...field}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Activo' | 'Inactivo')}
                  >
                    <option value="Activo">{t('prms.newPrm.statusActive')}</option>
                    <option value="Inactivo">{t('prms.newPrm.statusInactive')}</option>
                  </Select>
                )}
              </FormField>
            </div>
          </section>

          {/* Section: Datos médicos */}
          <section className="new-prm__section">
            <h2 className="new-prm__section-title">
              {t('prms.newPrm.sections.medical')}
            </h2>
            <div className="new-prm__grid">
              <FormField label={t('prms.newPrm.bloodType')} htmlFor="bloodType">
                {(field) => (
                  <Select
                    {...field}
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                  >
                    <option value="">{t('prms.newPrm.bloodTypePlaceholder')}</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </Select>
                )}
              </FormField>

              <FormField label={t('prms.newPrm.height')} htmlFor="height">
                {(field) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('prms.newPrm.heightPlaceholder')}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                )}
              </FormField>

              <FormField label={t('prms.newPrm.weight')} htmlFor="weight">
                {(field) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('prms.newPrm.weightPlaceholder')}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                )}
              </FormField>
            </div>
          </section>

          {/* Section: Contactos de urgencia */}
          <section className="new-prm__section">
            <h2 className="new-prm__section-title">
              {t('prms.newPrm.sections.contacts')}
            </h2>

            {contacts.map((contact, index) => (
              <div key={index} className="new-prm__contact-row">
                <div className="new-prm__grid">
                  <FormField label={t('prms.newPrm.contactName')}>
                    {(field) => (
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('prms.newPrm.contactNamePlaceholder')}
                        value={contact.name}
                        onChange={(event) => updateContact(index, 'name', event.target.value)}
                      />
                    )}
                  </FormField>
                  <FormField label={t('prms.newPrm.contactPhone')}>
                    {(field) => (
                      <Input
                        {...field}
                        type="tel"
                        placeholder={t('prms.newPrm.phonePlaceholder')}
                        value={contact.phone}
                        onChange={(event) => updateContact(index, 'phone', event.target.value)}
                      />
                    )}
                  </FormField>
                  <FormField label={t('prms.newPrm.contactRelationship')}>
                    {(field) => (
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('prms.newPrm.contactRelationshipPlaceholder')}
                        value={contact.relationship}
                        onChange={(event) => updateContact(index, 'relationship', event.target.value)}
                      />
                    )}
                  </FormField>
                </div>
                <IconButton
                  className="new-prm__contact-remove"
                  label={t('common.remove')}
                  icon={<Trash2 size={16} />}
                  tone="danger"
                  onClick={() => removeContact(index)}
                />
              </div>
            ))}

            {contacts.length < 2 ? (
              <Button
                variant="dashed"
                className="new-prm__add-contact-btn"
                icon={<Plus size={16} />}
                onClick={addContact}
              >
                {t('prms.newPrm.contactAdd')}
              </Button>
            ) : (
              <p className="new-prm__contact-max">{t('prms.newPrm.contactMax')}</p>
            )}
          </section>

          {/* Section: Direcciones */}
          <section className="new-prm__section">
            <h2 className="new-prm__section-title">{t('prms.newPrm.sections.addresses')}</h2>

            {addressDrafts.map((draft, index) => (
              <div key={index} className="new-prm__contact-row">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '1rem' }}>
                  <AddressSelector
                    value={draft.value}
                    onChange={(v) => updateAddressDraftValue(index, v)}
                    showValidation={false}
                  />
                  <Input
                    type="text"
                    placeholder={t('prms.newPrm.addressAlias')}
                    value={draft.alias}
                    onChange={(event) => updateAddressDraftAlias(index, event.target.value)}
                    maxLength={40}
                  />
                </div>
                <IconButton
                  className="new-prm__contact-remove"
                  label={t('common.remove')}
                  icon={<Trash2 size={16} />}
                  tone="danger"
                  onClick={() => removeAddressDraft(index)}
                />
              </div>
            ))}

            <Button
              variant="dashed"
              className="new-prm__add-contact-btn"
              icon={<Plus size={16} />}
              onClick={addAddressDraft}
            >
              {t('prms.newPrm.addAddress')}
            </Button>
          </section>

          {formError && <p className="new-prm__form-error">{formError}</p>}

          <div className="new-prm__actions">
            <Button to="/app/prms" variant="outline" size="lg">
              {t('prms.newPrm.cancel')}
            </Button>
            <Button type="submit" size="lg" loading={createPrm.isPending}>
              {createPrm.isPending
                ? t('prms.newPrm.submitting')
                : t('prms.newPrm.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
