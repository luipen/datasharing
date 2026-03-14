import React, { useState } from 'react';
import './MembersPanel.css';

const COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6',
];

export default function MembersPanel({ members, onRefresh }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setAdding(true);
    const r = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), color }),
    });
    setAdding(false);
    if (r.ok) {
      setName('');
      onRefresh();
    } else {
      const d = await r.json();
      setError(d.error || 'Failed to add member');
    }
  };

  const remove = async (id) => {
    if (!confirm('Remove this team member? Their chores will become unassigned.')) return;
    await fetch(`/api/members/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="members-panel">
      <h2 className="panel-title">Team Members</h2>
      <div className="card member-list">
        {members.length === 0 && <p className="empty-msg">No team members yet.</p>}
        {members.map(m => (
          <div key={m.id} className="member-row">
            <span className="member-avatar" style={{ background: m.color }}>
              {m.name[0].toUpperCase()}
            </span>
            <span className="member-name">{m.name}</span>
            <button className="btn-danger btn-sm" onClick={() => remove(m.id)}>Remove</button>
          </div>
        ))}
      </div>

      <div className="card add-member-form">
        <h3>Add Team Member</h3>
        <form onSubmit={add} className="add-form">
          <div style={{ flex: 1 }}>
            <label>Name</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Alex"
              required
            />
          </div>
          <div className="color-pick">
            <label>Color</label>
            <div className="color-swatches">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={['swatch', color === c ? 'selected' : ''].join(' ')}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
            </div>
          </div>
          <div className="add-actions">
            {error && <span className="err-msg">{error}</span>}
            <button type="submit" className="btn-primary" disabled={adding || !name.trim()}>
              {adding ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
