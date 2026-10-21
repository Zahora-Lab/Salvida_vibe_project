import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCreateUser } from '../../hooks/useProfile';
import { useProfile } from '../../hooks/useProfile';
import type { UserRole } from '../../types';
import { Input } from '../../components/ui/input';
import { FormField } from '../../components/ui/form-field';
import { Button, IconButton } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import './CreateUserModal.css';

interface Props {
  onClose: () => void;
}

export default function CreateUserModal({ onClose }: Props) {
  const { t } = useTranslation();
  const { data: liveProfile } = useProfile();
  const isSuperAdmin = liveProfile?.role === 'superadmin';

  const createUser = useCreateUser();

  const [method, setMethod] = useState<'invite' | 'direct'>('invite');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isDemo, setIsDemo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Email inválido';
    if (method === 'direct') {
      if (!password) next.password = 'La contraseña es requerida';
      else if (password.length < 8) next.password = 'Mínimo 8 caracteres';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    createUser.mutate(
      {
        email: email.trim().toLowerCase(),
        method,
        password: method === 'direct' ? password : undefined,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        organization: organization.trim(),
        role,
        is_demo: isDemo,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="cum-overlay"       onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="cum-modal" role="dialog" aria-modal="true">
        <div className="cum-header">
          <h2 className="cum-title">{t('users.create.title')}</h2>
          <IconButton label="Cerrar" icon={<X size={18} />} onClick={onClose} />
        </div>

        <div className="cum-tabs">
          <button
            className={`cum-tab${method === 'invite' ? ' cum-tab--active' : ''}`}
            onClick={() => setMethod('invite')}
            type="button"
          >
            Invitar por email
          </button>
          <button
            className={`cum-tab${method === 'direct' ? ' cum-tab--active' : ''}`}
            onClick={() => setMethod('direct')}
            type="button"
          >
            Crear con contraseña
          </button>
        </div>

        <form className="cum-form" onSubmit={handleSubmit} noValidate>
          <FormField
            variant="small"
            label="Email"
            htmlFor="cum-email"
            required
            error={errors.email}
          >
            {(field) => (
              <Input
                {...field}
                size="sm"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            )}
          </FormField>

          {method === 'direct' && (
            <FormField
              variant="small"
              label="Contraseña"
              htmlFor="cum-password"
              required
              error={errors.password}
            >
              {(field) => (
                <Input
                  {...field}
                  size="sm"
                  type="password"
                  showLabel="Mostrar contraseña"
                  hideLabel="Ocultar contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              )}
            </FormField>
          )}

          <div className="cum-row">
            <FormField variant="small" label="Nombre" htmlFor="cum-first">
              {(field) => (
                <Input
                  {...field}
                  size="sm"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              )}
            </FormField>
            <FormField variant="small" label="Apellido" htmlFor="cum-last">
              {(field) => (
                <Input
                  {...field}
                  size="sm"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              )}
            </FormField>
          </div>

          <div className="cum-row">
            <FormField variant="small" label="Teléfono" htmlFor="cum-phone">
              {(field) => (
                <Input
                  {...field}
                  size="sm"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              )}
            </FormField>
            <FormField variant="small" label="Organización" htmlFor="cum-org">
              {(field) => (
                <Input
                  {...field}
                  size="sm"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              )}
            </FormField>
          </div>

          <FormField variant="small" label="Rol">
            {(field) => (
              <Select
                {...field}
                size="sm"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="user">{t('userRoles.user')}</option>
                {isSuperAdmin && <option value="admin">Admin</option>}
              </Select>
            )}
          </FormField>

          {isSuperAdmin && (
            <label className="cum-toggle">
              <span className="cum-toggle-label">{t('users.demo')}</span>
              <Switch label={t('users.demo')} checked={isDemo} onChange={setIsDemo} />
            </label>
          )}

          {method === 'invite' && (
            <p className="cum-hint">
              {t('users.create.inviteNote')}
            </p>
          )}

          <div className="cum-actions">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={createUser.isPending}>
              {createUser.isPending ? 'Creando…' : method === 'invite' ? 'Enviar invitación' : t('users.create.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
