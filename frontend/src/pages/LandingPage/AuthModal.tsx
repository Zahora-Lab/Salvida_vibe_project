import { useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuthFormStore } from '../../store/useAuthFormStore';
import { Input } from '../../components/ui/input';
import { FormField } from '../../components/ui/form-field';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    firstName, setFirstName,
    lastName, setLastName,
    dni, setDni,
    phone, setPhone,
    loading, setLoading,
    error, setError,
    success, setSuccess,
    reset,
  } = useAuthFormStore();

  useEffect(() => { reset(); }, [open, reset]);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('login.passwordMismatch'));
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, dni, phone },
      },
    });
    setLoading(false);

    if (authError) {
      setError(t('login.errorRegisterGeneric'));
      return;
    }

    if (data.session) {
      setSession(data.session);
      onClose();
      navigate('/app');
      return;
    }

    setSuccess(t('login.registerSuccess'));
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      header={<span className="lp-modal__logo">Salvida</span>}
      aria-label={t('login.registerTab')}
      rootClassName="lp-modal-root"
      className="lp-modal"
    >
      <h2 className="lp-modal__title">{t('login.registerTab')}</h2>

      <form onSubmit={handleRegister}>
        <div className="lp-modal__field-row">
          <FormField variant="small" label={t('login.firstName')} htmlFor="modal-reg-firstname" className="lp-modal__field">
            {(field) => (
              <Input
                {...field}
                type="text"
                placeholder={t('login.firstNamePlaceholder')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
            )}
          </FormField>
          <FormField variant="small" label={t('login.lastName')} htmlFor="modal-reg-lastname" className="lp-modal__field">
            {(field) => (
              <Input
                {...field}
                type="text"
                placeholder={t('login.lastNamePlaceholder')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
            )}
          </FormField>
        </div>

        <FormField variant="small" label={t('login.dni')} htmlFor="modal-reg-dni" className="lp-modal__field">
          {(field) => (
            <Input
              {...field}
              type="text"
              placeholder={t('login.dniPlaceholder')}
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
              autoComplete="off"
            />
          )}
        </FormField>

        <FormField variant="small" label={t('login.phone')} htmlFor="modal-reg-phone" className="lp-modal__field">
          {(field) => (
            <Input
              {...field}
              type="tel"
              placeholder={t('login.phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          )}
        </FormField>

        <FormField variant="small" label={t('login.email')} htmlFor="modal-reg-email" className="lp-modal__field">
          {(field) => (
            <Input
              {...field}
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          )}
        </FormField>

        <FormField variant="small" label={t('login.password')} htmlFor="modal-reg-password" className="lp-modal__field">
          {(field) => (
            <Input
              {...field}
              type="password"
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              showLabel={t('login.showPassword')}
              hideLabel={t('login.hidePassword')}
            />
          )}
        </FormField>

        <FormField variant="small" label={t('login.confirmPassword')} htmlFor="modal-reg-confirm" className="lp-modal__field">
          {(field) => (
            <Input
              {...field}
              type="password"
              placeholder={t('login.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              showLabel={t('login.showPassword')}
              hideLabel={t('login.hidePassword')}
            />
          )}
        </FormField>

        {error && <p className="lp-modal__error">{error}</p>}
        {success ? (
          <>
            <p className="lp-modal__success">{success}</p>
            <Button size="lg" fullWidth className="lp-modal__submit" onClick={() => { onClose(); navigate('/login'); }}>
              {t('login.goToLogin')}
            </Button>
          </>
        ) : (
          <Button type="submit" size="lg" fullWidth className="lp-modal__submit" loading={loading}>
            {loading ? t('login.registerSubmitting') : t('login.registerSubmit')}
          </Button>
        )}
      </form>

      <p className="lp-modal__login-link">
        {t('login.alreadyHaveAccount')}{' '}
        <button type="button" onClick={() => { onClose(); navigate('/login'); }}>
          {t('login.loginTab')}
        </button>
      </p>
    </Modal>
  );
}
