import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import './LoginForm.css';

interface LoginFormProps {
  /** Called after a successful login, before navigating to /app */
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? t('login.errorInvalid')
          : t('login.errorGeneric'),
      );
      return;
    }

    if (data.session) {
      setSession(data.session);
      onSuccess?.();
      navigate('/app');
    }
  }

  return (
    <form className="login__form" onSubmit={handleSubmit}>
      <FormField label={t('login.email')} htmlFor="lf-email">
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

      <FormField label={t('login.password')} htmlFor="lf-password">
        {(field) => (
          <Input
            {...field}
            type="password"
            placeholder={t('login.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            showLabel={t('login.showPassword')}
            hideLabel={t('login.hidePassword')}
          />
        )}
      </FormField>

      {error && <Alert>{error}</Alert>}

      <Button type="submit" size="lg" fullWidth className="login__submit" loading={loading}>
        {loading ? t('login.submitting') : t('login.submit')}
      </Button>
    </form>
  );
}
