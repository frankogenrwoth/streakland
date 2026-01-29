const express = require('express');
const path = require('path');

const container = require('../../container');
const Habit = require('../../domain/entities/habit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve SPA static
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/habits', async (req, res) => {
  try {
    const adapter = container.getInstance('habitAdapter', { filePath: './data/habits.json' });
    const habits = await adapter.getHabits();
    const today = new Date().toISOString().split('T')[0];
    const visible = habits.filter(h => h.last_check !== today);
    res.json(visible);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/habits', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const adapter = container.getInstance('habitAdapter', { filePath: './data/habits.json' });
    const id = String(Date.now());
    const habit = new Habit(id, name, null, 0);
    await adapter.addHabit(habit);
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/habits/:id/checkin', async (req, res) => {
  try {
    const adapter = container.getInstance('habitAdapter', { filePath: './data/habits.json' });
    const { CheckInHabitUseCase } = require('../../application/usecases/checkInHabit');
    const usecase = new CheckInHabitUseCase(adapter);
    const updated = await usecase.execute(req.params.id);
    const habits = await adapter.getHabits();
    const today = new Date().toISOString().split('T')[0];
    const remaining = habits.filter(h => h.last_check !== today);
    res.json({ updated, remaining });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Express SPA server listening on http://localhost:${PORT}`);
});

module.exports = app;
