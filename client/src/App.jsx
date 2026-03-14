import React, { useState, useEffect, useCallback } from 'react';
import Calendar from './components/Calendar.jsx';
import ChoreModal from './components/ChoreModal.jsx';
import MembersPanel from './components/MembersPanel.jsx';
import ChoresList from './components/ChoresList.jsx';
import './App.css';

const API = '/api';

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [tab, setTab] = useState('calendar'); // calendar | chores | members
  const [members, setMembers] = useState([]);
  const [chores, setChores] = useState([]);
  const [calEvents, setCalEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [choreModal, setChoreModal] = useState(null); // null | { chore? }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const fetchMembers = useCallback(async () => {
    const r = await fetch(`${API}/members`);
    setMembers(await r.json());
  }, []);

  const fetchChores = useCallback(async () => {
    const r = await fetch(`${API}/chores`);
    setChores(await r.json());
  }, []);

  const fetchCalendar = useCallback(async (year, month) => {
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const end = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
    const r = await fetch(`${API}/calendar?start=${start}&end=${end}`);
    setCalEvents(await r.json());
  }, []);

  useEffect(() => { fetchMembers(); fetchChores(); }, []);
  useEffect(() => { fetchCalendar(currentMonth.year, currentMonth.month); }, [currentMonth]);

  const refresh = useCallback(() => {
    fetchMembers();
    fetchChores();
    fetchCalendar(currentMonth.year, currentMonth.month);
  }, [currentMonth]);

  const toggleComplete = useCallback(async (chore_id, date, completed) => {
    if (completed) {
      await fetch(`${API}/completions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chore_id, occurrence_date: date }),
      });
    } else {
      await fetch(`${API}/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chore_id, occurrence_date: date }),
      });
    }
    fetchCalendar(currentMonth.year, currentMonth.month);
  }, [currentMonth]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="logo">🧹 Office Chores</span>
          <nav className="tabs">
            <button className={tab === 'calendar' ? 'tab active' : 'tab'} onClick={() => setTab('calendar')}>Calendar</button>
            <button className={tab === 'chores' ? 'tab active' : 'tab'} onClick={() => setTab('chores')}>Chores</button>
            <button className={tab === 'members' ? 'tab active' : 'tab'} onClick={() => setTab('members')}>Team</button>
          </nav>
        </div>
        <div className="header-right">
          {(tab === 'calendar' || tab === 'chores') && (
            <button className="btn-primary" onClick={() => setChoreModal({})}>+ Add Chore</button>
          )}
          <button className="btn-ghost theme-toggle" onClick={() => setDark(d => !d)} title="Toggle theme">
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {tab === 'calendar' && (
          <Calendar
            events={calEvents}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            onToggleComplete={toggleComplete}
            onEditChore={(chore) => setChoreModal({ chore })}
          />
        )}
        {tab === 'chores' && (
          <ChoresList
            chores={chores}
            members={members}
            onEdit={(chore) => setChoreModal({ chore })}
            onDelete={async (id) => {
              await fetch(`${API}/chores/${id}`, { method: 'DELETE' });
              refresh();
            }}
          />
        )}
        {tab === 'members' && (
          <MembersPanel members={members} onRefresh={fetchMembers} />
        )}
      </main>

      {choreModal !== null && (
        <ChoreModal
          chore={choreModal.chore}
          members={members}
          onClose={() => setChoreModal(null)}
          onSave={async (data) => {
            if (choreModal.chore?.id) {
              await fetch(`${API}/chores/${choreModal.chore.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
            } else {
              await fetch(`${API}/chores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
            }
            setChoreModal(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
