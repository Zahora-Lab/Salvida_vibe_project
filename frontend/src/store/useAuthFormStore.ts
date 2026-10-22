import { create } from 'zustand';

export type AuthTab = 'login' | 'register';

interface AuthFormState {
  tab: AuthTab;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  loading: boolean;
  error: string | null;
  success: string | null;

  setTab: (tab: AuthTab) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setDni: (v: string) => void;
  setPhone: (v: string) => void;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  setSuccess: (v: string | null) => void;
  reset: () => void;
}

const initialFields = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  dni: '',
  phone: '',
  loading: false,
  error: null,
  success: null,
};

export const useAuthFormStore = create<AuthFormState>((set) => ({
  tab: 'login',
  ...initialFields,

  setTab: (tab) => set({ tab, ...initialFields }),
  setEmail: (v) => set({ email: v }),
  setPassword: (v) => set({ password: v }),
  setConfirmPassword: (v) => set({ confirmPassword: v }),
  setFirstName: (v) => set({ firstName: v }),
  setLastName: (v) => set({ lastName: v }),
  setDni: (v) => set({ dni: v }),
  setPhone: (v) => set({ phone: v }),
  setLoading: (v) => set({ loading: v }),
  setError: (v) => set({ error: v }),
  setSuccess: (v) => set({ success: v }),
  reset: () => set(initialFields),
}));
