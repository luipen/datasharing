import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isBefore, parseISO } from 'date-fns';
import './Calendar.css';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar({ events, currentMonth, setCurrentMonth, onToggleComplete, onEditChore }) {
  const { year, month } = currentMonth;

  const monthDate = useMemo(() => new Date(year, month, 1), [year, month]);

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthDate));
    const end = endOfWeek(endOfMonth(monthDate));
    const days = [];
    let d = start;
    while (d <= end) { days.push(d); d = addDays(d, 1); }
    const result = [];
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7));
    return result;
  }, [monthDate]);

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  const prev = () => {
    setCurrentMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  };
  const next = () => {
    setCurrentMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  };
  const goToday = () => {
    const now = new Date();
    setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() });
  };

  return (
    <div className="calendar">
      <div className="cal-header">
        <button className="btn-ghost btn-sm" onClick={prev}>‹</button>
        <button className="btn-ghost btn-sm" onClick={goToday}>Today</button>
        <h2 className="cal-title">{format(monthDate, 'MMMM yyyy')}</h2>
        <button className="btn-ghost btn-sm" onClick={next}>›</button>
      </div>

      <div className="cal-grid">
        {DAY_NAMES.map(d => (
          <div key={d} className="cal-day-name">{d}</div>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[key] || [];
            const inMonth = isSameMonth(day, monthDate);
            const today = isToday(day);
            const past = isBefore(day, new Date()) && !today;

            return (
              <div
                key={key}
                className={[
                  'cal-cell',
                  inMonth ? '' : 'out-month',
                  today ? 'today' : '',
                ].join(' ')}
              >
                <div className="cal-date">{format(day, 'd')}</div>
                <div className="cal-events">
                  {dayEvents.map(ev => (
                    <ChoreChip
                      key={ev.chore_id + ev.date}
                      ev={ev}
                      past={past}
                      onToggle={() => onToggleComplete(ev.chore_id, ev.date, ev.completed)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ChoreChip({ ev, past, onToggle }) {
  const overdue = past && !ev.completed;
  const color = ev.member_color || '#6366f1';

  return (
    <div
      className={['chore-chip', ev.completed ? 'done' : '', overdue ? 'overdue' : ''].join(' ')}
      style={{ '--chip-color': color }}
      title={ev.member_name ? `Assigned: ${ev.member_name}` : ''}
    >
      <button
        className="chip-check"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        title={ev.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {ev.completed ? '✓' : '○'}
      </button>
      <span className="chip-title">{ev.title}</span>
      {ev.member_name && (
        <span
          className="chip-avatar"
          style={{ background: color }}
          title={ev.member_name}
        >
          {ev.member_name[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}
