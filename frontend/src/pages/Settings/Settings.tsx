import Header from "../../components/layout/header/Header";
import {
  User,
  Bell,
  Shield,
  Palette,
  Languages,
  Camera,
  Save,
  Share2,
  MapPin,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import type { NotificationPrefs, UserProfile } from "../../types";
import {
  useProfile,
  useUpdateProfile,
  useUpdateNotificationPrefs,
  useUsers,
  useArchiveUser,
} from "../../hooks/useProfile";
import { DropdownMenu } from "../../components/ui/dropdown-menu";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import UserSelector from "../../components/features/user/user-selector/UserSelector";
import SettingsRRSS from "./SettingsRRSS";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-toastify";
import { useDebounce } from "../../hooks/useDebounce";
import { Input } from "../../components/ui/input";
import { FormField } from "../../components/ui/form-field";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Avatar } from '@/components/ui/avatar';
import "./Settings.css";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY as string;

interface Section {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  adminOnly?: boolean;
}

const baseSections: Section[] = [
  { id: "profile", icon: User, labelKey: "settings.sectionsLabels.profile" },
  {
    id: "notifications",
    icon: Bell,
    labelKey: "settings.sectionsLabels.notifications",
  },
  {
    id: "security",
    icon: Shield,
    labelKey: "settings.sectionsLabels.security",
  },
  {
    id: "appearance",
    icon: Palette,
    labelKey: "settings.sectionsLabels.appearance",
  },
  {
    id: "language",
    icon: Languages,
    labelKey: "settings.sectionsLabels.language",
  },
  {
    id: "rrss",
    icon: Share2,
    labelKey: "settings.sectionsLabels.rrss",
    adminOnly: true,
  },
];

export default function Settings() {
  const { t } = useTranslation();
  const { data: currentUser } = useProfile();
  const isAdminUser = currentUser?.role === "admin" || currentUser?.role === "superadmin";

  const sections = baseSections.filter((s) => !s.adminOnly || isAdminUser);

  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState("profile");
  const [selectedUserId, setSelectedUserId] = useState(
    () => searchParams.get("userId") ?? "",
  );
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: updateNotificationPrefs, isPending: isSavingPrefs } =
    useUpdateNotificationPrefs();
  const { subscribe: subscribePush, unsubscribe: unsubscribePush } =
    usePushNotifications();
  const archiveUser = useArchiveUser();
  const [notifTargetUser, setNotifTargetUser] = useState<UserProfile | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error(t("prmDetail.toast.imageFormat"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("prmDetail.toast.imageSize"));
      return;
    }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const targetUserId = selectedUserId || profile?.id;
      if (!targetUserId) return;
      const path = `${targetUserId}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      updateProfile({
        avatar: urlData.publicUrl,
        targetUserId: selectedUserId || undefined,
      });
    } catch {
      toast.error(t("prmDetail.toast.uploadError"));
    } finally {
      setUploadingAvatar(false);
    }
  }
  const { data: users } = useUsers(isAdminUser && activeSection === "profile");

  const [form, setForm] = useState(() => ({
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    dni: profile?.dni ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    organization: profile?.organization ?? "",
    avatar: profile?.avatar ?? "",
  }));

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(() =>
    notifTargetUser?.notification_prefs ?? profile?.notification_prefs ?? { email: false, push: true, booking_reminder: true },
  );

  const [municipalityQuery, setMunicipalityQuery] = useState("");
  const [municipalitySuggestions, setMunicipalitySuggestions] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [municipalityOpen, setMunicipalityOpen] = useState(false);
  const [municipalityLoading, setMunicipalityLoading] = useState(false);
  const [municipalitySelected, setMunicipalitySelected] = useState(false);
  const [municipalityCoords, setMunicipalityCoords] = useState<{ lat: number; lng: number } | null>(null);
  const debouncedMunicipality = useDebounce(municipalityQuery, 300);
  const municipalityRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (municipalityRef.current && !municipalityRef.current.contains(e.target as Node)) {
        setMunicipalityOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (municipalitySelected || !debouncedMunicipality || debouncedMunicipality.length < 2) {
      setMunicipalitySuggestions([]);
      if (!municipalitySelected) setMunicipalityOpen(false);
      return;
    }
    const controller = new AbortController();
    setMunicipalityLoading(true);
    fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(debouncedMunicipality)}&lang=es&filter=countrycode:es&type=city&limit=6&apiKey=${GEOAPIFY_KEY}`,
      { signal: controller.signal },
    )
      .then((r) => r.json())
      .then((data: { features?: Array<{ properties: { formatted: string }; geometry: { coordinates: [number, number] } }> }) => {
        const items = (data.features ?? []).map((f) => ({
          label: f.properties.formatted,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        }));
        setMunicipalitySuggestions(items);
        setMunicipalityOpen(items.length > 0);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setMunicipalitySuggestions([]);
      })
      .finally(() => setMunicipalityLoading(false));
    return () => controller.abort();
  }, [debouncedMunicipality, municipalitySelected]);

  const handleMunicipalitySelect = useCallback((item: { label: string; lat: number; lng: number }) => {
    setMunicipalityQuery(item.label);
    setMunicipalityCoords({ lat: item.lat, lng: item.lng });
    setMunicipalitySelected(true);
    setMunicipalityOpen(false);
    setMunicipalitySuggestions([]);
  }, []);


  const activeItem = sections.find((s) => s.id === activeSection);

  const initials =
    form.firstName || form.lastName
      ? `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase()
      : "?";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const extra = (municipalitySelected && municipalityCoords)
      ? { municipality: municipalityQuery, default_lat: municipalityCoords.lat, default_lng: municipalityCoords.lng }
      : {};
    updateProfile({ ...form, ...extra, targetUserId: selectedUserId || undefined });
  }

  return (
    <div className="settings">
      <Header title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="settings__body">
        <div className="settings__inner">
          {/* Sub-navigation */}
          <aside className="settings-nav">
            <div className="settings-nav__list">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`settings-nav__btn${activeSection === section.id ? " settings-nav__btn--active" : ""}`}
                >
                  <section.icon size={18} />
                  <span>{t(section.labelKey)}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Settings Panel */}
          <div className="settings-panel">
            {activeSection === "rrss" ? (
              <SettingsRRSS />
            ) : activeSection === "notifications" ? (
              <div className="settings-notifications">
                <h3 className="settings-profile__title">
                  {t("settings.notifications.title")}
                </h3>
                <p className="settings-notifications__desc">
                  {t("settings.notifications.desc")}
                </p>

                {isAdminUser && (
                  <UserSelector
                    value={notifTargetUser?.id ?? ''}
                    onChange={(_id, user) => setNotifTargetUser(user)}
                    onClear={() => setNotifTargetUser(null)}
                    label={t("settings.manageUser")}
                    placeholder={t("settings.searchUserPlaceholder")}
                  />
                )}

                <div className="settings-notifications__group">
                  <h4 className="settings-notifications__group-title">
                    {t("settings.notifications.channel")}
                  </h4>

                  <div className="settings-notif-row">
                    <div className="settings-notif-row__info">
                      <span className="settings-notif-row__label">
                        {t("settings.notifications.emailLabel")}
                      </span>
                      <span className="settings-notif-row__sub">
                        {t("settings.notifications.emailDesc")}
                        {!profile?.email && (
                          <span className="settings-notif-row__warning">
                            {" "}
                            — Requiere un email validado en tu perfil
                          </span>
                        )}
                      </span>
                    </div>
                    <Switch
                      label={t("settings.notifications.emailLabel")}
                      checked={notifPrefs.email}
                      disabled={!(notifTargetUser ? notifTargetUser.email : profile?.email)}
                      onChange={(next) => setNotifPrefs((p) => ({ ...p, email: next }))}
                    />
                  </div>

                  <div className="settings-notif-row">
                    <div className="settings-notif-row__info">
                      <span className="settings-notif-row__label">
                        {t("settings.notifications.pushLabel")}
                      </span>
                      <span className="settings-notif-row__sub">
                        {t("settings.notifications.pushDesc")}
                      </span>
                    </div>
                    <Switch
                      label={t("settings.notifications.pushLabel")}
                      checked={notifPrefs.push}
                      onChange={(next) => {
                        setNotifPrefs((p) => ({ ...p, push: next }));
                        if (!notifTargetUser) {
                          if (next) subscribePush();
                          else unsubscribePush();
                        }
                      }}
                    />
                  </div>
                  {isAdminUser && notifTargetUser && (
                    <p className="settings-notif-row__sub" style={{ marginTop: '-8px', marginBottom: '8px' }}>
                      La suscripción del navegador la activa el propio usuario desde su sesión.
                    </p>
                  )}
                </div>

                <div className="settings-notifications__group">
                  <h4 className="settings-notifications__group-title">
                    {t("settings.notifications.typesTitle")}
                  </h4>

                  <div className="settings-notif-row">
                    <div className="settings-notif-row__info">
                      <span className="settings-notif-row__label">
                        {t("settings.notifications.reminderLabel")}
                      </span>
                      <span className="settings-notif-row__sub">
                        Aviso 2 horas antes de cada servicio programado
                      </span>
                    </div>
                    <Switch
                      label={t("settings.notifications.reminderLabel")}
                      checked={notifPrefs.booking_reminder}
                      onChange={(next) =>
                        setNotifPrefs((p) => ({ ...p, booking_reminder: next }))
                      }
                    />
                  </div>
                </div>

                <div className="settings-profile__footer">
                  <Button
                    size="lg"
                    icon={<Save size={20} />}
                    disabled={isSavingPrefs || isPending}
                    onClick={() => {
                      if (notifTargetUser) {
                        updateProfile({ notification_prefs: notifPrefs, targetUserId: notifTargetUser.id });
                      } else {
                        updateNotificationPrefs(notifPrefs);
                      }
                    }}
                  >
                    {isSavingPrefs
                      ? t("common.saving")
                      : t("settings.notifications.save")}
                  </Button>
                </div>
              </div>
            ) : activeSection === "profile" ? (
              <div className="settings-profile">
                {isAdminUser && (
                  <UserSelector
                    value={selectedUserId}
                    onChange={(id, u) => {
                      setSelectedUserId(id);
                      setForm({
                        firstName: u.firstName ?? "",
                        lastName: u.lastName ?? "",
                        dni: u.dni ?? "",
                        email: u.email ?? "",
                        phone: u.phone ?? "",
                        organization: u.organization ?? "",
                        avatar: u.avatar ?? "",
                      });
                      setMunicipalityQuery(u.municipality ?? "");
                      setMunicipalitySelected(!!u.municipality);
                      setMunicipalityCoords(
                        u.default_lat != null && u.default_lng != null
                          ? { lat: u.default_lat, lng: u.default_lng }
                          : null,
                      );
                    }}
                  />
                )}
                <div className="settings-profile__title-row">
                  <div className="settings-profile__title-group">
                    <h3 className="settings-profile__title">
                      {t("settings.profile.title")}
                    </h3>
                    {(() => {
                      const selectedUser = selectedUserId
                        ? users?.find((u) => u.id === selectedUserId)
                        : null;
                      const isArchived = selectedUser
                        ? selectedUser.isActive === false
                        : false;
                      return (
                        <Badge tone={isArchived ? "neutral" : "success"}>
                          {isArchived
                            ? t("settings.profile.statusArchived")
                            : t("settings.profile.statusActive")}
                        </Badge>
                      );
                    })()}
                  </div>
                  {isAdminUser &&
                    selectedUserId &&
                    (() => {
                      const selectedUser = users?.find(
                        (u) => u.id === selectedUserId,
                      );
                      if (!selectedUser) return null;
                      return (
                        <DropdownMenu
                          items={[
                            {
                              label:
                                selectedUser.isActive === false
                                  ? t(
                                      "settings.profile.userActions.restoreUser",
                                    )
                                  : t(
                                      "settings.profile.userActions.archiveUser",
                                    ),
                              onClick: () =>
                                setConfirmArchiveId(selectedUser.id),
                              variant:
                                selectedUser.isActive === false
                                  ? "default"
                                  : "danger",
                            },
                          ]}
                        />
                      );
                    })()}
                </div>

                {isLoading ? (
                  <p className="settings-profile__loading">
                    {t("settings.loading")}
                  </p>
                ) : (
                  <>
                    {/* Avatar */}
                    <div className="settings-avatar">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) handleAvatarFile(file);
                          event.target.value = "";
                        }}
                      />
                      <div className="settings-avatar__wrap">
                        <Avatar
                          className="settings-avatar__circle"
                          src={
                            (selectedUserId
                              ? form.avatar
                              : form.avatar || profile?.avatar) || undefined
                          }
                          alt="Avatar"
                        >
                          {initials}
                        </Avatar>
                        <button
                          type="button"
                          className="settings-avatar__btn"
                          disabled={uploadingAvatar}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera size={14} />
                        </button>
                      </div>
                      <div className="settings-avatar__info">
                        <Button
                          loading={uploadingAvatar}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploadingAvatar
                            ? t("settings.profile.uploading")
                            : t("settings.profile.changePhoto")}
                        </Button>
                        <p className="settings-avatar__hint">
                          {t("settings.profile.photoHint")}
                        </p>
                      </div>
                    </div>

                    {/* Form */}
                    <form className="settings-form" onSubmit={handleSubmit}>
                      <FormField variant="eyebrow" label={t("settings.profile.firstName")}>
                        {(field) => (
                          <Input
                            {...field}
                            variant="filled"
                            type="text"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            placeholder={t(
                              "settings.profile.firstNamePlaceholder",
                            )}
                          />
                        )}
                      </FormField>
                      <FormField variant="eyebrow" label={t("settings.profile.lastName")}>
                        {(field) => (
                          <Input
                            {...field}
                            variant="filled"
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            placeholder={t(
                              "settings.profile.lastNamePlaceholder",
                            )}
                          />
                        )}
                      </FormField>
                      <FormField variant="eyebrow" label={t("settings.profile.dni")}>
                        {(field) => (
                          <Input
                            {...field}
                            variant="filled"
                            type="text"
                            name="dni"
                            value={form.dni}
                            onChange={handleChange}
                            placeholder={t("settings.profile.dniPlaceholder")}
                            autoComplete="off"
                          />
                        )}
                      </FormField>
                      <FormField variant="eyebrow" label={t("settings.profile.email")}>
                        {(field) => (
                          <Input
                            {...field}
                            variant="filled"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder={t("settings.profile.emailPlaceholder")}
                          />
                        )}
                      </FormField>
                      <FormField variant="eyebrow" label={t("settings.profile.phone")}>
                        {(field) => (
                          <Input
                            {...field}
                            variant="filled"
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder={t("settings.profile.phonePlaceholder")}
                          />
                        )}
                      </FormField>
                      <FormField variant="eyebrow" label={t("settings.profile.organization")} className="settings-form__field--full">
                        {(field) => (
                          <Input
                            {...field}
                            variant="filled"
                            type="text"
                            name="organization"
                            value={form.organization}
                            onChange={handleChange}
                            placeholder={t(
                              "settings.profile.organizationPlaceholder",
                            )}
                          />
                        )}
                      </FormField>

                      <div className="settings-form__field--full" ref={municipalityRef} style={{ position: "relative", zIndex: 2 }}>
                          <FormField variant="eyebrow" label="Municipio">
                            {(field) => (
                              <Input
                                {...field}
                                variant="filled"
                                type="text"
                                value={municipalityQuery}
                                onChange={(e) => {
                                  setMunicipalityQuery(e.target.value);
                                  if (municipalitySelected) {
                                    setMunicipalitySelected(false);
                                    setMunicipalityCoords(null);
                                  }
                                }}
                                onFocus={() => {
                                  if (!municipalitySelected && municipalitySuggestions.length > 0) setMunicipalityOpen(true);
                                }}
                                placeholder="Busca tu municipio..."
                                className={municipalitySelected ? "settings-form__input--selected" : undefined}
                              />
                            )}
                          </FormField>
                          {municipalityLoading && <span className="settings-zone__spinner" />}
                          {municipalityOpen && municipalitySuggestions.length > 0 && (
                            <ul className="settings-zone__dropdown">
                              {municipalitySuggestions.map((item) => (
                                <li key={item.label + item.lat}>
                                  <button
                                    type="button"
                                    className="settings-zone__dropdown-item"
                                    onClick={() => handleMunicipalitySelect(item)}
                                  >
                                    <MapPin size={13} />
                                    {item.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                      <div className="settings-profile__footer">
                        <Button
                          type="submit"
                          size="lg"
                          icon={<Save size={20} />}
                          loading={isPending}
                        >
                          {isPending
                            ? t("settings.profile.saving")
                            : t("settings.profile.save")}
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            ) : (
              activeItem && (
                <div className="settings-placeholder">
                  <div className="settings-placeholder__icon">
                    <activeItem.icon size={48} />
                  </div>
                  <h3 className="settings-placeholder__title">
                    {t(activeItem.labelKey)}
                  </h3>
                  <p className="settings-placeholder__desc">
                    {t("settings.placeholder.underDevelopment")}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {confirmArchiveId &&
        (() => {
          const target = users?.find((u) => u.id === confirmArchiveId);
          const isArchiving = target?.isActive !== false;
          return (
            <ConfirmDialog
              open
              title={
                isArchiving
                  ? t("settings.confirm.archiveTitle")
                  : t("settings.confirm.restoreTitle")
              }
              description={
                isArchiving
                  ? t("settings.confirm.archiveDesc", {
                      name: `${target?.firstName} ${target?.lastName}`,
                    })
                  : t("settings.confirm.restoreDesc", {
                      name: `${target?.firstName} ${target?.lastName}`,
                    })
              }
              confirmLabel={
                isArchiving
                  ? t("settings.confirm.archiveBtn")
                  : t("settings.confirm.restoreBtn")
              }
              variant={isArchiving ? "danger" : "default"}
              onConfirm={() => {
                archiveUser.mutate(confirmArchiveId);
                setConfirmArchiveId(null);
              }}
              onCancel={() => setConfirmArchiveId(null)}
            />
          );
        })()}
    </div>
  );
}
