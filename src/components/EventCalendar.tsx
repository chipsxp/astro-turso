import { useState } from "react";

export interface CalendarEvent {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  is_all_day: boolean;
  venue_name: string | null;
  city: string | null;
  color: string | null;
}

export interface SaleItem {
  id: number;
  slug: string;
  title: string;
  promo_label: string | null;
  promo_discount_pct: number | null;
  promo_start: string;
  promo_end: string;
  etsy_price_amount: number | null;
  etsy_price_divisor: number;
  etsy_price_currency: string;
  etsy_listing_url: string | null;
}

type SelectedItem =
  | { kind: "event"; data: CalendarEvent }
  | { kind: "sale"; data: SaleItem };

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SALE_COLOR = "#c09838";
const DEFAULT_EVENT_COLOR = "#4a7fcb";

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTodayStr(): string {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(`${dateStr.slice(0, 10)}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDisplayTime(time: string | null): string | null {
  if (!time) return null;
  const d = new Date(`1970-01-01T${time}:00`);
  if (Number.isNaN(d.getTime())) return time;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatPrice(
  amount: number | null,
  divisor: number,
  currency: string,
): string | null {
  if (amount == null) return null;
  return `${currency} ${(amount / divisor).toFixed(2)}`;
}

interface Props {
  events: CalendarEvent[];
  sales: SaleItem[];
  siteUrl: string;
}

export default function EventCalendar({ events, sales, siteUrl }: Props) {
  const todayStr = getTodayStr();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [selected, setSelected] = useState<SelectedItem | null>(null);

  // Max navigable month = current + 2
  const maxTotalMonth = currentMonth + 2;
  const maxYear = currentYear + Math.floor(maxTotalMonth / 12);
  const maxMonth = maxTotalMonth % 12;

  const isAtMin = viewYear === currentYear && viewMonth === currentMonth;
  const isAtMax = viewYear === maxYear && viewMonth === maxMonth;

  function prevMonth() {
    if (isAtMin) return;
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelected(null);
  }

  function nextMonth() {
    if (isAtMax) return;
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelected(null);
  }

  // Build calendar grid cells
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function getItemsForDay(day: number) {
    const dateStr = toDateStr(viewYear, viewMonth, day);
    const dayEvents = events.filter((e) => {
      const end = e.end_date ?? e.start_date;
      return dateStr >= e.start_date && dateStr <= end;
    });
    const daySales = sales.filter(
      (s) => dateStr >= s.promo_start && dateStr <= s.promo_end,
    );
    return { dayEvents, daySales };
  }

  function selectEvent(e: CalendarEvent) {
    setSelected((prev) =>
      prev?.kind === "event" && prev.data.id === e.id
        ? null
        : { kind: "event", data: e },
    );
  }

  function selectSale(s: SaleItem) {
    setSelected((prev) =>
      prev?.kind === "sale" && prev.data.id === s.id
        ? null
        : { kind: "sale", data: s },
    );
  }

  return (
    <div className="cal-wrap">
      <div className="cal-grid-col">
        {/* Month navigation */}
        <div className="cal-nav">
          <button
            className="cal-nav__btn"
            onClick={prevMonth}
            disabled={isAtMin}
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="cal-nav__label">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            className="cal-nav__btn"
            onClick={nextMonth}
            disabled={isAtMax}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        {/* Calendar grid */}
        <div className="cal-grid">
          {DAY_NAMES.map((d) => (
            <div key={d} className="cal-day-header">
              {d}
            </div>
          ))}

          {cells.map((day, i) => {
            if (day === null) {
              return (
                <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />
              );
            }

            const dateStr = toDateStr(viewYear, viewMonth, day);
            const isToday = dateStr === todayStr;
            const { dayEvents, daySales } = getItemsForDay(day);

            const allItems: SelectedItem[] = [
              ...dayEvents.map((e) => ({ kind: "event" as const, data: e })),
              ...daySales.map((s) => ({ kind: "sale" as const, data: s })),
            ];
            const visibleItems = allItems.slice(0, 3);
            const overflow = allItems.length - visibleItems.length;

            return (
              <div
                key={day}
                className={`cal-cell${isToday ? " cal-cell--today" : ""}`}
              >
                <span className="cal-cell__day">{day}</span>
                <div className="cal-cell__pills">
                  {visibleItems.map((item) => {
                    if (item.kind === "event") {
                      const color = item.data.color ?? DEFAULT_EVENT_COLOR;
                      const isActive =
                        selected?.kind === "event" &&
                        selected.data.id === item.data.id;
                      return (
                        <button
                          key={`e-${item.data.id}`}
                          className={`cal-pill cal-pill--event${isActive ? " cal-pill--active" : ""}`}
                          style={{ background: color }}
                          onClick={() => selectEvent(item.data)}
                          title={item.data.title}
                        >
                          {item.data.title}
                        </button>
                      );
                    } else {
                      const isActive =
                        selected?.kind === "sale" &&
                        selected.data.id === item.data.id;
                      return (
                        <button
                          key={`s-${item.data.id}`}
                          className={`cal-pill cal-pill--sale${isActive ? " cal-pill--active" : ""}`}
                          onClick={() => selectSale(item.data)}
                          title={item.data.title}
                        >
                          {item.data.promo_label ?? item.data.title}
                        </button>
                      );
                    }
                  })}
                  {overflow > 0 && (
                    <span className="cal-cell__overflow">+{overflow} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="cal-legend">
          <span className="cal-legend__item">
            <span
              className="cal-legend__dot"
              style={{ background: DEFAULT_EVENT_COLOR }}
            />
            Events
          </span>
          <span className="cal-legend__item">
            <span
              className="cal-legend__dot"
              style={{ background: SALE_COLOR }}
            />
            Sales
          </span>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <aside
          className="cal-panel"
          role="complementary"
          aria-label="Item details"
        >
          <button
            className="cal-panel__close"
            onClick={() => setSelected(null)}
            aria-label="Close"
          >
            ✕
          </button>

          {selected.kind === "event" && (
            <div className="cal-panel__content">
              <p className="cal-panel__type">Event</p>
              <h3 className="cal-panel__title">{selected.data.title}</h3>
              <p className="cal-panel__date">
                {formatDisplayDate(selected.data.start_date)}
                {selected.data.end_date &&
                selected.data.end_date !== selected.data.start_date
                  ? ` – ${formatDisplayDate(selected.data.end_date)}`
                  : ""}
              </p>
              {selected.data.is_all_day ? (
                <p className="cal-panel__time">All Day</p>
              ) : selected.data.start_time ? (
                <p className="cal-panel__time">
                  {formatDisplayTime(selected.data.start_time)}
                  {selected.data.end_time
                    ? ` – ${formatDisplayTime(selected.data.end_time)}`
                    : ""}
                </p>
              ) : null}
              {selected.data.venue_name && (
                <p className="cal-panel__venue">
                  {selected.data.venue_name}
                  {selected.data.city ? ` · ${selected.data.city}` : ""}
                </p>
              )}
              {selected.data.description && (
                <p className="cal-panel__desc">{selected.data.description}</p>
              )}
              <a
                href={`${siteUrl}/events/${selected.data.slug}`}
                className="cal-panel__cta"
              >
                View Event →
              </a>
            </div>
          )}

          {selected.kind === "sale" && (
            <div className="cal-panel__content">
              <p className="cal-panel__type cal-panel__type--sale">Sale</p>
              <h3 className="cal-panel__title">{selected.data.title}</h3>
              {selected.data.promo_label && (
                <p className="cal-panel__promo-label">
                  {selected.data.promo_label}
                </p>
              )}
              {selected.data.promo_discount_pct != null && (
                <p className="cal-panel__discount">
                  {selected.data.promo_discount_pct}% off
                </p>
              )}
              <p className="cal-panel__date">
                {formatDisplayDate(selected.data.promo_start)} –{" "}
                {formatDisplayDate(selected.data.promo_end)}
              </p>
              {formatPrice(
                selected.data.etsy_price_amount,
                selected.data.etsy_price_divisor,
                selected.data.etsy_price_currency,
              ) && (
                <p className="cal-panel__price">
                  {formatPrice(
                    selected.data.etsy_price_amount,
                    selected.data.etsy_price_divisor,
                    selected.data.etsy_price_currency,
                  )}
                </p>
              )}
              <a
                href={`${siteUrl}/shop/${selected.data.slug}`}
                className="cal-panel__cta"
              >
                View Listing →
              </a>
              {selected.data.etsy_listing_url && (
                <a
                  href={selected.data.etsy_listing_url}
                  className="cal-panel__cta cal-panel__cta--secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Etsy →
                </a>
              )}
            </div>
          )}
        </aside>
      )}

      {/* Mobile backdrop */}
      {selected && (
        <div
          className="cal-backdrop"
          onClick={() => setSelected(null)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
