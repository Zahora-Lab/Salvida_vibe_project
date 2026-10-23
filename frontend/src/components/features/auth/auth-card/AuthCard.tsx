import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import './AuthCard.css';

interface AuthCardProps {
  /** When true, shows tabs so the user can switch to the register form */
  showRegister?: boolean;
}

type Tab = 'login' | 'register';

export default function AuthCard({ showRegister = false }: AuthCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [tab, setTab] = useState<Tab>(showRegister ? 'register' : 'login');

  // When prop changes, reset tab to match (controlled from URL query param)
  const initialTab = showRegister ? 'register' : 'login';
  if (tab !== initialTab && showRegister) {
    setTab(initialTab);
  }

  // ── Login state ──────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // ── Register state ───────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoginLoading(false);

    if (authError) {
      setLoginError(
        authError.message === 'Invalid login credentials'
          ? t('login.errorInvalid')
          : t('login.errorGeneric'),
      );
      return;
    }

    if (data.session) {
      setSession(data.session);
      navigate('/app');
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setRegError(null);

    if (regPassword !== confirmPassword) {
      setRegError(t('login.passwordMismatch'));
      return;
    }

    setRegLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: { first_name: firstName, last_name: lastName, dni, phone },
      },
    });
    setRegLoading(false);

    if (authError) {
      setRegError(t('login.errorRegisterGeneric'));
      return;
    }

    if (data.session) {
      setSession(data.session);
      navigate('/app');
      return;
    }

    setRegSuccess(t('login.registerSuccess'));
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {showRegister && (
        <Tabs
          stretch
          className="auth-card__tabs"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'login', label: t('login.loginTab') },
            { value: 'register', label: t('login.registerTab') },
          ]}
        />
      )}

      {tab === 'login' ? (
        <form className="auth-card__form" onSubmit={handleLogin}>
          <FormField label={t('login.email')} htmlFor="ac-email">
            {(field) => (
              <Input
                {...field}
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
              />
            )}
          </FormField>

          <FormField label={t('login.password')} htmlFor="ac-password">
            {(field) => (
              <Input
                {...field}
                type="password"
                placeholder={t('login.passwordPlaceholder')}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
                showLabel={t('login.showPassword')}
                hideLabel={t('login.hidePassword')}
              />
            )}
          </FormField>

          {loginError && <p className="auth-card__error">{loginError}</p>}

          <Button type="submit" size="lg" fullWidth className="auth-card__submit" loading={loginLoading}>
            {loginLoading ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>
      ) : (
        <form className="auth-card__form" onSubmit={handleRegister}>
          <div className="auth-card__field-row">
            <FormField label={t('login.firstName')} htmlFor="ac-firstname">
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
            <FormField label={t('login.lastName')} htmlFor="ac-lastname">
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

          <FormField label={t('login.dni')} htmlFor="ac-dni">
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

          <FormField label={t('login.phone')} htmlFor="ac-phone">
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

          <FormField label={t('login.email')} htmlFor="ac-reg-email">
            {(field) => (
              <Input
                {...field}
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                autoComplete="email"
              />
            )}
          </FormField>

          <FormField label={t('login.password')} htmlFor="ac-reg-password">
            {(field) => (
              <Input
                {...field}
                type="password"
                placeholder={t('login.passwordPlaceholder')}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                autoComplete="new-password"
                showLabel={t('login.showPassword')}
                hideLabel={t('login.hidePassword')}
              />
            )}
          </FormField>

          <FormField label={t('login.confirmPassword')} htmlFor="ac-confirm">
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

          {regError && <p className="auth-card__error">{regError}</p>}
          {regSuccess ? (
            <>
              <p className="auth-card__success">{regSuccess}</p>
              <Button
                size="lg"
                fullWidth
                className="auth-card__submit"
                onClick={() => setTab('login')}
              >
                {t('login.goToLogin')}
              </Button>
            </>
          ) : (
            <Button type="submit" size="lg" fullWidth className="auth-card__submit" loading={regLoading}>
              {regLoading ? t('login.registerSubmitting') : t('login.registerSubmit')}
            </Button>
          )}
        </form>
      )}
    </>
  );
}
