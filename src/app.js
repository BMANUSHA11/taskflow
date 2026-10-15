require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/tasks', tasksRouter);

// 404 for unknown routes
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`TaskFlow API running on http://localhost:${port}`));
}

module.exports = app;
