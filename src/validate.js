const STATUSES = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/**
 * Validates a task payload.
 * @param {object} body    request body
 * @param {boolean} partial true for PATCH (all fields optional)
 * @returns {{errors: string[], data: object}}
 */
function validateTask(body = {}, partial = false) {
  const errors = [];
  const data = {};

  if (body.title !== undefined || !partial) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      errors.push('title is required and must be a non-empty string');
    } else if (body.title.trim().length > 150) {
      errors.push('title must be at most 150 characters');
    } else {
      data.title = body.title.trim();
    }
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') {
      errors.push('description must be a string or null');
    } else {
      data.description = body.description;
    }
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      errors.push(`status must be one of: ${STATUSES.join(', ')}`);
    } else {
      data.status = body.status;
    }
  }

  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) {
      errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);
    } else {
      data.priority = body.priority;
    }
  }

  if (body.due_date !== undefined) {
    if (body.due_date !== null && !isValidDate(body.due_date)) {
      errors.push('due_date must be a valid date in YYYY-MM-DD format or null');
    } else {
      data.due_date = body.due_date;
    }
  }

  return { errors, data };
}

module.exports = { validateTask, isValidDate, STATUSES, PRIORITIES };
