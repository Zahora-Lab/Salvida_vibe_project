import { useState, useMemo } from 'react';
import Header from '../../components/layout/header/Header';
import CalendarWidget from '../../components/features/booking/calendar-widget/CalendarWidget';
import FilterBar from '../../components/features/booking/filter-bar/FilterBar';
import type { BookingFilterValues } from '../../components/features/booking/filter-bar/FilterBar';
import BookingCard from '../../components/features/booking/booking-card/BookingCard';
import type { MultiSelectOption } from '../../components/ui/multi-select';
import ContractModal from '../../components/features/booking/contract-modal/ContractModal';
import { CreateButton } from '../../components/ui/button';
import {
  CalendarDays,
  List,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useBookings,
  useDeleteBooking,
  useUpdateBookingStatus,
} from '../../hooks/useBookings';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDateISO } from '../../utils';
import type { Booking } from '../../types';
import './Dashboard.css';

// ─── Types ───────────────────────────────────────────────────────────────────

type SortKey = 'date' | 'startTime' | 'prmName' | 'status' | 'owner_name';

type View = 'calendar' | 'list';

// Mobile-only collapsible panels. Only one can be open at a time.
type Panel = 'calendar' | 'filters' | null;

// ─── View toggle ─────────────────────────────────────────────────────────────

function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (view: View) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="dashboard__view-toggle">
      <button
        className={`dashboard__view-btn${view === 'calendar' ? ' dashboard__view-btn--active' : ''}`}
        onClick={() => onChange('calendar')}
      >
        <CalendarDays size={16} />
        <span>{t('dashboard.viewCalendar')}</span>
      </button>
      <button
        className={`dashboard__view-btn${view === 'list' ? ' dashboard__view-btn--active' : ''}`}
        onClick={() => onChange('list')}
      >
        <List size={16} />
        <span>{t('dashboard.viewList')}</span>
      </button>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteBooking = useDeleteBooking();
  const updateStatus = useUpdateBookingStatus();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // ── Contract signing ───────────────────────────────────────────────────────
  const [signingBooking, setSigningBooking] = useState<Booking | null>(null);

  // ── View toggle ────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>('calendar');
  const [openPanel, setOpenPanel] = useState<Panel>(null);

  function handleViewChange(next: View) {
    setView(next);
    setOpenPanel(null);
  }

  function togglePanel(panel: Exclude<Panel, null>) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  // ── Shared filter state ────────────────────────────────────────────────────
  const [filters, setFilters] = useState<BookingFilterValues>({
    ownerIds: [],
    prmIds: [],
    statuses: [],
    dateFrom: '',
    dateTo: '',
  });

  function handleFilterChange(patch: Partial<BookingFilterValues>) {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      // Reset PRMs whenever the owner selection changes — a PRM belongs to a
      // single owner, so a stale prm filter would silently hide every booking.
      if (patch.ownerIds) next.prmIds = [];
      return next;
    });
  }

  // Derive the ownerId hint for PrmMultiSelect: only meaningful when 1 user selected
  const singleOwnerId =
    filters.ownerIds.length === 1 ? filters.ownerIds[0] : undefined;

  // Common active filters (no date range — those are list-only)
  const baseFilters = useMemo(
    () => ({
      status: filters.statuses.length ? filters.statuses : undefined,
      prmId: filters.prmIds.length ? filters.prmIds : undefined,
      ownerId: filters.ownerIds.length ? filters.ownerIds : undefined,
    }),
    [filters.statuses, filters.prmIds, filters.ownerIds],
  );

  // ── Calendar view state ───────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<{
    year: number;
    month: number;
  }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  const dateStr = formatDateISO(selectedDate);

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setOpenPanel(null);
  }

  const { data: bookings = [], isLoading } = useBookings(
    { date: dateStr, ...baseFilters },
    { enabled: view === 'calendar' },
  );

  const monthDateFrom = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(
    calendarMonth.year,
    calendarMonth.month + 1,
    0,
  ).getDate();
  const monthDateTo = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  const { data: monthBookings = [] } = useBookings(
    { date_from: monthDateFrom, date_to: monthDateTo, ...baseFilters },
    { enabled: view === 'calendar' },
  );

  const bookingsByDate = useMemo<Record<string, Booking[]>>(() => {
    return monthBookings.reduce<Record<string, Booking[]>>(
      (accumulator, booking) => {
        (accumulator[booking.date] ??= []).push(booking);
        return accumulator;
      },
      {},
    );
  }, [monthBookings]);

  const total = bookings.length;
  const pending = bookings.filter(
    (booking) => booking.status === 'Pending',
  ).length;
  const completed = bookings.filter(
    (booking) => booking.status === 'Completed',
  ).length;

  const todayStr = formatDateISO(new Date());
  const isToday = dateStr === todayStr;
  const dateLabel = isToday
    ? t('dashboard.todayBookings')
    : t('dashboard.dateLabel', {
        date: selectedDate.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
        }),
      });

  // ── Mobile bar labels ──────────────────────────────────────────────────────
  const mobileDateLabel = selectedDate.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const activeFilterCount =
    filters.ownerIds.length +
    filters.prmIds.length +
    filters.statuses.length +
    (view === 'list'
      ? Number(Boolean(filters.dateFrom)) + Number(Boolean(filters.dateTo))
      : 0);

  // ── List view state ────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { data: listBookings = [], isLoading: listLoading } = useBookings(
    {
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
      ...baseFilters,
    },
    { enabled: view === 'list' },
  );

  const sortedBookings = useMemo(
    () =>
      [...listBookings].sort((bookingA, bookingB) => {
        const valueA = String(bookingA[sortKey] ?? '');
        const valueB = String(bookingB[sortKey] ?? '');
        return sortDir === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }),
    [listBookings, sortKey, sortDir],
  );

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortColumns: { key: SortKey; label: string }[] = [
    { key: 'date', label: t('dashboard.sort.date') },
    { key: 'startTime', label: t('dashboard.sort.time') },
    { key: 'prmName', label: t('dashboard.sort.prm') },
    { key: 'status', label: t('dashboard.sort.status') },
    ...(isAdmin
      ? [
          {
            key: 'owner_name' as SortKey,
            label: t('dashboard.sort.responsible'),
          },
        ]
      : []),
  ];

  // ── Status options for MultiSelect ─────────────────────────────────────────
  const statusOptions = useMemo<MultiSelectOption[]>(
    () => [
      { id: 'SignPending', label: t('bookingStatuses.SignPending') },
      { id: 'Pending', label: t('bookingStatuses.Pending') },
      { id: 'Approved', label: t('bookingStatuses.Approved') },
      { id: 'Completed', label: t('bookingStatuses.Completed') },
      { id: 'Cancelled', label: t('bookingStatuses.Cancelled') },
    ],
    [t],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">
      <Header
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        actions={<ViewToggle view={view} onChange={handleViewChange} />}
      />

      <div className="dashboard__body">
        {/* ── Mobile-only: view toggle + new booking ── */}
        <div className="dashboard__mobile-toolbar">
          <ViewToggle view={view} onChange={handleViewChange} />
          <CreateButton
            display="icon"
            to="/app/bookings/new"
            state={view === 'calendar' ? { date: dateStr } : undefined}
            label={t('dashboard.newBookingShort')}
          />
        </div>

        {/* ── Mobile-only: date selector + filters toggle ── */}
        <div className="dashboard__mobile-bar">
          {view === 'calendar' && (
            <button
              type="button"
              className="dashboard__mobile-chip dashboard__mobile-chip--date"
              aria-expanded={openPanel === 'calendar'}
              onClick={() => togglePanel('calendar')}
            >
              <CalendarDays size={16} />
              <span className="dashboard__mobile-chip-text">
                {mobileDateLabel}
              </span>
              <ChevronDown size={16} className="dashboard__chevron" />
            </button>
          )}
          <button
            type="button"
            className="dashboard__mobile-chip dashboard__mobile-chip--filters"
            aria-expanded={openPanel === 'filters'}
            onClick={() => togglePanel('filters')}
          >
            <SlidersHorizontal size={16} />
            <span>{t('dashboard.filtersToggle')}</span>
            {activeFilterCount > 0 && (
              <span className="dashboard__mobile-badge">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown size={16} className="dashboard__chevron" />
          </button>
        </div>

        {/* ── Calendar view ── */}
        {view === 'calendar' && (
          <div className="dashboard__grid">
            <div className="dashboard__left">
              {/* Kept mounted (only hidden via CSS on mobile) so the widget
                  preserves its selected day and visible month. */}
              <div
                className={`dashboard__calendar${openPanel === 'calendar' ? ' dashboard__calendar--open' : ''}`}
              >
                <CalendarWidget
                  onDateSelect={handleDateSelect}
                  onMonthChange={setCalendarMonth}
                  bookingsByDate={bookingsByDate}
                />
              </div>
              <div className="summary-card">
                <h4 className="summary-card__title">
                  {t('dashboard.summary')}
                </h4>
                <div className="summary-card__rows">
                  <div className="summary-card__row">
                    <span className="summary-card__label">
                      {t('dashboard.todayTotal')}
                    </span>
                    <span className="summary-card__value">
                      {isLoading ? '—' : `${total} ${t('dashboard.trips')}`}
                    </span>
                  </div>
                  <div className="summary-card__row">
                    <span className="summary-card__label">
                      {t('dashboard.pending')}
                    </span>
                    <span className="summary-card__value summary-card__value--pending">
                      {isLoading ? '—' : pending}
                    </span>
                  </div>
                  <div className="summary-card__row">
                    <span className="summary-card__label">
                      {t('dashboard.completed')}
                    </span>
                    <span className="summary-card__value summary-card__value--completed">
                      {isLoading ? '—' : completed}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard__right">
              {/* Filter bar — calendar view (no date range) */}
              <div
                className={`dashboard__filters${openPanel === 'filters' ? ' dashboard__filters--open' : ''}`}
              >
                <FilterBar
                  isAdmin={isAdmin}
                  singleOwnerId={singleOwnerId}
                  statusOptions={statusOptions}
                  values={filters}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="bookings-header">
                <h3 className="bookings-header__title">{dateLabel}</h3>
              </div>

              {isLoading ? (
                <div className="booking-list">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="booking-card booking-card--skeleton"
                    />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="booking-list booking-list--empty">
                  <p className="booking-list__empty-text">
                    {t('dashboard.noBookingsToday')}
                  </p>
                </div>
              ) : (
                <div className="booking-list">
                  {bookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onEdit={() =>
                        navigate(`/app/bookings/${booking.id}/edit`)
                      }
                      onDelete={() => deleteBooking.mutate(booking.id)}
                      onStatusChange={(status) =>
                        updateStatus.mutate({ id: booking.id, status })
                      }
                      onSign={() => setSigningBooking(booking)}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              )}

              <CreateButton
                variant="dashed"
                to="/app/bookings/new"
                state={{ date: dateStr }}
                label={t('dashboard.newBooking')}
              />
            </div>
          </div>
        )}

        {/* ── List view ── */}
        {view === 'list' && (
          <div className="dashboard__list-view">
            {/* Filter bar — list view (with date range) */}
            <div
              className={`dashboard__filters${openPanel === 'filters' ? ' dashboard__filters--open' : ''}`}
            >
              <FilterBar
                isAdmin={isAdmin}
                showDateRange
                singleOwnerId={singleOwnerId}
                statusOptions={statusOptions}
                values={filters}
                onChange={handleFilterChange}
              />
            </div>

            {/* Sort controls */}
            <div className="booking-sort">
              <span className="booking-sort__label">
                {t('dashboard.sort.label')}:
              </span>
              <div className="booking-sort__chips">
                {sortColumns.map((col) => (
                  <button
                    key={col.key}
                    className={`booking-sort__chip${sortKey === col.key ? ' booking-sort__chip--active' : ''}`}
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {sortKey === col.key &&
                      (sortDir === 'asc' ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      ))}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking list */}
            {listLoading ? (
              <div className="booking-list">
                <div className="booking-card booking-card--skeleton" />
                <div className="booking-card booking-card--skeleton" />
                <div className="booking-card booking-card--skeleton" />
              </div>
            ) : sortedBookings.length === 0 ? (
              <div className="booking-list booking-list--empty">
                <p className="booking-list__empty-text">
                  {t('dashboard.noBookings')}
                </p>
              </div>
            ) : (
              <div className="booking-list">
                {sortedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onEdit={() => navigate(`/app/bookings/${booking.id}/edit`)}
                    onDelete={() => deleteBooking.mutate(booking.id)}
                    onStatusChange={(status) =>
                      updateStatus.mutate({ id: booking.id, status })
                    }
                    onSign={() => setSigningBooking(booking)}
                    isAdmin={isAdmin}
                    showDate
                  />
                ))}
              </div>
            )}

            <CreateButton variant="dashed" to="/app/bookings/new" label={t('dashboard.newBooking')} />
          </div>
        )}
      </div>

      {signingBooking && (
        <ContractModal
          booking={signingBooking}
          onClose={() => setSigningBooking(null)}
          onSigned={() => setSigningBooking(null)}
        />
      )}
    </div>
  );
}
