const express = require('express');
const { get, all, run } = require('../db');
const { validateTask, STATUSES, PRIORITIES } = require('../validate');

const router = express.Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function findTask(id) {
  return get('SELECT * FROM tasks WHERE id = ?', [id]);
}

router.get('/stats', wrap(async (req, res) => {
  const rows = await all('SELECT status, COUNT(*) AS count FROM tasks GROUP BY status');
  const stats = { todo: 0, in_progress: 0, done: 0 };
  rows.forEach((r) => {
    if (stats[r.status] !== undefined) stats[r.status] = Number(r.count);
  });
  res.json({ total: Object.values(stats).reduce((a, b) => a + b, 0), ...stats });
}));

router.get('/', wrap(async (req, res) => {
  const { status, priority, q } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
  }
  if (priority && !PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of: ${PRIORITIES.join(', ')}` });
  }

  const where = [];
  const params = [];
  if (status) { where.push('status = ?'); params.push(status); }
  if (priority) { where.push('priority = ?'); params.push(priority); }
  if (q) { where.push('title LIKE ?'); params.push(`%${q}%`); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalRow = await get(`SELECT COUNT(*) AS total FROM tasks ${clause}`, params);
  const total = Number(totalRow?.total || 0);
  const rows = await all(
    `SELECT * FROM tasks ${clause} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );

  res.json({ data: rows, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 } });
}));

router.get('/:id', wrap(async (req, res) => {
  const task = await findTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
}));

router.post('/', wrap(async (req, res) => {
  const { errors, data } = validateTask(req.body, false);
  if (errors.length) return res.status(400).json({ errors });

  const result = await run(
    'INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)',
    [data.title, data.description ?? null, data.status || 'todo', data.priority || 'medium', data.due_date ?? null]
  );

  res.status(201).json(await findTask(result.id));
}));

router.patch('/:id', wrap(async (req, res) => {
  const existing = await findTask(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const { errors, data } = validateTask(req.body, true);
  if (errors.length) return res.status(400).json({ errors });
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided to update' });
  }

  const updates = [];
  const params = [];

  if (data.title !== undefined) { updates.push('title = ?'); params.push(data.title); }
  if (data.description !== undefined) { updates.push('description = ?'); params.push(data.description); }
  if (data.status !== undefined) { updates.push('status = ?'); params.push(data.status); }
  if (data.priority !== undefined) { updates.push('priority = ?'); params.push(data.priority); }
  if (data.due_date !== undefined) { updates.push('due_date = ?'); params.push(data.due_date); }

  updates.push('updated_at = datetime(\'now\')');
  params.push(req.params.id);

  await run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);
  res.json(await findTask(req.params.id));
}));

router.delete('/:id', wrap(async (req, res) => {
  const result = await run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
  res.status(204).send();
}));

module.exports = router;
