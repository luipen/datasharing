import React, { useState } from 'react';
import { format } from 'date-fns';
import './Modal.css';

const today = format(new Date(), 'yyyy-MM-dd');

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function ChoreModal({ chore, members, onClose, onSave }) {
  const [title, setTitle] = useState(chore?.title || '');
  const [description, setDescription] = useState(chore?.description || '');
  const [memberId, setMemberId] = useState(chore?.member_id || '');
  const [recurrence, setRecurrence] = useState(chore?.recurrence || 'none');
  const [interval, setInterval] = useState(chore?.recurrence_interval || 1);
  const [selectedDays, setSelectedDays] = useState(() => {
    if (chore?.recurrence_days) {
      try { return JSON.parse(chore.recurrence_days); } catch {}
    }
    return [];
  });
  const [startDate, setStartDate] = useState(chore?.start_date || today);
  const [endDate, setEndDate] = useState(chore?.end_date || '');
  const [saving, setSaving] = useState(false);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title,
      description,
      member_id: memberId || null,
      recurrence,
      recurrence_interval: Number(interval),
      recurrence_days: recurrence === 'weekly' && selectedDays.length ? selectedDays : null,
      start_date: startDate,
      end_date: endDate || null,
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal card">
        <div className="modal-header">
          <h3>{chore?.id ? 'Edit Chore' : 'New Chore'}</h3>
          <button className="btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSave} className="modal-body">
          <div className="field">
            <label>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Clean kitchen" required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Optional details..." />
          </div>
          <div className="field">
            <label>Assign to</label>
            <select value={memberId} onChange={e => setMemberId(e.target.value)}>
              <option value="">— Unassigned —</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Start date *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div className="field">
              <label>End date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
            </div>
          </div>
          <div className="field">
            <label>Recurrence</label>
            <select value={recurrence} onChange={e => setRecurrence(e.target.value)}>
              <option value="none">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          {recurrence !== 'none' && (
            <div className="field-row">
              <div className="field field-narrow">
                <label>Every</label>
                <input
                  type="number"
                  min={1} max={99}
                  value={interval}
                  onChange={e => setInterval(e.target.value)}
                />
              </div>
              <div className="field-unit">
                {recurrence === 'daily' ? 'day(s)' : recurrence === 'weekly' ? 'week(s)' : 'month(s)'}
              </div>
            </div>
          )}
          {recurrence === 'weekly' && (
            <div className="field">
              <label>On days (leave empty = same weekday as start)</label>
              <div className="day-picker">
                {DAYS_OF_WEEK.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    className={['day-btn', selectedDays.includes(d.value) ? 'active' : ''].join(' ')}
                    onClick={() => toggleDay(d.value)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving || !title.trim()}>
              {saving ? 'Saving…' : chore?.id ? 'Save changes' : 'Add chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
