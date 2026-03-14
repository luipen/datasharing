const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { getOccurrences } = require('./occurrences');

const app = express();
app.use(cors());
app.use(express.json());

// ── Members ──────────────────────────────────────────────────────────────────

app.get('/api/members', (req, res) => {
  res.json(db.prepare('SELECT * FROM members ORDER BY name').all());
});

app.post('/api/members', (req, res) => {
  const { name, color = '#6366f1' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const id = uuidv4();
  try {
    db.prepare('INSERT INTO members (id, name, color) VALUES (?, ?, ?)').run(id, name.trim(), color);
    res.status(201).json(db.prepare('SELECT * FROM members WHERE id = ?').get(id));
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Name already exists' });
    throw e;
  }
});

app.delete('/api/members/:id', (req, res) => {
  db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Chores ───────────────────────────────────────────────────────────────────

app.get('/api/chores', (req, res) => {
  const chores = db.prepare(`
    SELECT c.*, m.name as member_name, m.color as member_color
    FROM chores c
    LEFT JOIN members m ON c.member_id = m.id
    ORDER BY c.title
  `).all();
  res.json(chores);
});

app.post('/api/chores', (req, res) => {
  const {
    title, description = '', member_id = null,
    recurrence = 'none', recurrence_interval = 1,
    recurrence_days = null, start_date, end_date = null
  } = req.body;

  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  if (!start_date) return res.status(400).json({ error: 'start_date required' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO chores (id, title, description, member_id, recurrence, recurrence_interval, recurrence_days, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title.trim(), description, member_id, recurrence, recurrence_interval,
         recurrence_days ? JSON.stringify(recurrence_days) : null, start_date, end_date);

  const chore = db.prepare(`
    SELECT c.*, m.name as member_name, m.color as member_color
    FROM chores c LEFT JOIN members m ON c.member_id = m.id
    WHERE c.id = ?
  `).get(id);
  res.status(201).json(chore);
});

app.put('/api/chores/:id', (req, res) => {
  const {
    title, description, member_id,
    recurrence, recurrence_interval, recurrence_days, start_date, end_date
  } = req.body;

  const chore = db.prepare('SELECT * FROM chores WHERE id = ?').get(req.params.id);
  if (!chore) return res.status(404).json({ error: 'Not found' });

  db.prepare(`
    UPDATE chores SET
      title = ?, description = ?, member_id = ?,
      recurrence = ?, recurrence_interval = ?, recurrence_days = ?,
      start_date = ?, end_date = ?
    WHERE id = ?
  `).run(
    title ?? chore.title,
    description ?? chore.description,
    member_id !== undefined ? member_id : chore.member_id,
    recurrence ?? chore.recurrence,
    recurrence_interval ?? chore.recurrence_interval,
    recurrence_days !== undefined ? (recurrence_days ? JSON.stringify(recurrence_days) : null) : chore.recurrence_days,
    start_date ?? chore.start_date,
    end_date !== undefined ? end_date : chore.end_date,
    req.params.id
  );

  const updated = db.prepare(`
    SELECT c.*, m.name as member_name, m.color as member_color
    FROM chores c LEFT JOIN members m ON c.member_id = m.id
    WHERE c.id = ?
  `).get(req.params.id);
  res.json(updated);
});

app.delete('/api/chores/:id', (req, res) => {
  db.prepare('DELETE FROM chores WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Occurrences / Calendar ────────────────────────────────────────────────────

app.get('/api/calendar', (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'start and end required' });

  const chores = db.prepare(`
    SELECT c.*, m.name as member_name, m.color as member_color
    FROM chores c
    LEFT JOIN members m ON c.member_id = m.id
  `).all();

  const completions = db.prepare(
    'SELECT * FROM completions WHERE occurrence_date >= ? AND occurrence_date <= ?'
  ).all(start, end);

  const completionMap = {};
  for (const c of completions) {
    completionMap[`${c.chore_id}::${c.occurrence_date}`] = c;
  }

  const events = [];
  for (const chore of chores) {
    const dates = getOccurrences(chore, start, end);
    for (const date of dates) {
      const completion = completionMap[`${chore.id}::${date}`] || null;
      events.push({
        chore_id: chore.id,
        title: chore.title,
        description: chore.description,
        date,
        member_id: chore.member_id,
        member_name: chore.member_name,
        member_color: chore.member_color,
        completed: !!completion,
        completed_at: completion?.completed_at || null,
        recurrence: chore.recurrence,
      });
    }
  }

  res.json(events);
});

// ── Completions ───────────────────────────────────────────────────────────────

app.post('/api/completions', (req, res) => {
  const { chore_id, occurrence_date } = req.body;
  if (!chore_id || !occurrence_date) return res.status(400).json({ error: 'chore_id and occurrence_date required' });

  const id = uuidv4();
  try {
    db.prepare('INSERT INTO completions (id, chore_id, occurrence_date) VALUES (?, ?, ?)').run(id, chore_id, occurrence_date);
    res.status(201).json({ ok: true });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Already completed' });
    throw e;
  }
});

app.delete('/api/completions', (req, res) => {
  const { chore_id, occurrence_date } = req.body;
  db.prepare('DELETE FROM completions WHERE chore_id = ? AND occurrence_date = ?').run(chore_id, occurrence_date);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Chore server running on http://localhost:${PORT}`));
