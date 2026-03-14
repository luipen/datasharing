import React, { useState } from 'react';
import './ChoresList.css';

const RECURRENCE_LABEL = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export default function ChoresList({ chores, members, onEdit, onDelete }) {
  const [search, setSearch] = useState('');

  const filtered = chores.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chores-list">
      <div className="chores-toolbar">
        <h2 className="panel-title">All Chores</h2>
        <input
          className="search-box"
          placeholder="Search chores…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <p className="empty-msg">No chores found. Click "+ Add Chore" to create one.</p>
      )}

      <div className="chores-grid">
        {filtered.map(c => (
          <ChoreCard key={c.id} chore={c} onEdit={() => onEdit(c)} onDelete={() => onDelete(c.id)} />
        ))}
      </div>
    </div>
  );
}

function ChoreCard({ chore, onEdit, onDelete }) {
  const color = chore.member_color || '#6366f1';

  const recLabel = chore.recurrence === 'none'
    ? 'One-time'
    : chore.recurrence_interval > 1
      ? `Every ${chore.recurrence_interval} ${chore.recurrence}s`
      : RECURRENCE_LABEL[chore.recurrence];

  return (
    <div className="chore-card card" style={{ '--accent-color': color }}>
      <div className="cc-accent" />
      <div className="cc-body">
        <div className="cc-header">
          <span className="cc-title">{chore.title}</span>
          <div className="cc-actions">
            <button className="btn-ghost btn-sm" onClick={onEdit}>Edit</button>
            <button className="btn-danger btn-sm" onClick={onDelete}>Delete</button>
          </div>
        </div>
        {chore.description && <p className="cc-desc">{chore.description}</p>}
        <div className="cc-meta">
          <span className="meta-chip">{recLabel}</span>
          <span className="meta-chip">Starts {chore.start_date}</span>
          {chore.end_date && <span className="meta-chip">Ends {chore.end_date}</span>}
          {chore.member_name && (
            <span className="meta-chip assignee" style={{ background: color + '22', color }}>
              <span className="mini-avatar" style={{ background: color }}>
                {chore.member_name[0].toUpperCase()}
              </span>
              {chore.member_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
