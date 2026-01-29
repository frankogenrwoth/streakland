let habits = [];
let idx = 0;

const urlParams = new URLSearchParams(window.location.search);
const repoParam = urlParams.get('repo');
const useLocal = repoParam ? repoParam === 'local' : (typeof window.localStorage !== 'undefined');
const STORAGE_KEY = 'streakland.habits';

async function fetchHabits() {
  if (!useLocal) {
    const res = await fetch('/api/habits');
    return res.json();
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  let all = [];
  try { all = JSON.parse(raw || '[]'); } catch (e) { all = []; }
  const today = new Date().toISOString().split('T')[0];
  return all.filter(h => h.last_check !== today);
}

function renderCard(h) {
  const wrapper = document.getElementById('cardWrapper');
  wrapper.innerHTML = '';
  if (!h) return;
  const card = document.createElement('div');
  card.className = 'card glass-card habit-card';
  card.style.cursor = 'pointer';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  const title = document.createElement('h3');
  title.textContent = h.name;
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `streak: ${h.streak} • last: ${h.last_check || '-'}`;

  card.appendChild(title);
  card.appendChild(meta);
  wrapper.appendChild(card);
  card.addEventListener('click', checkCurrent);
  card.addEventListener('keyup', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') checkCurrent(); });

  card.style.transform = 'translateY(8px) scale(0.98)';
  card.style.opacity = '0';
  requestAnimationFrame(() => {
    card.style.transition = 'transform 260ms ease, opacity 260ms ease';
    card.style.transform = '';
    card.style.opacity = '1';
  });
}

async function addHabit(name) {
  if (!useLocal) {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return res.json();
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  let all = [];
  try { all = JSON.parse(raw || '[]'); } catch (e) { all = []; }
  const id = String(Date.now());
  const habit = { id, name, last_check: null, streak: 0 };
  all.push(habit);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return habit;
}

async function load() {
  habits = await fetchHabits();
  if (!Array.isArray(habits) || habits.length === 0) {
    document.getElementById('cardWrapper').innerHTML = '';
    document.getElementById('controls').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    return;
  }
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('controls').style.display = '';
  if (idx >= habits.length) idx = 0;
  renderCard(habits[idx]);
}

document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  if (!name) return;
  await addHabit(name);
  document.getElementById('name').value = '';
  await load();
});

document.getElementById('nextBtn').addEventListener('click', (e) => {
  if (habits.length === 0) return;
  idx = (idx + 1) % habits.length;
  renderCard(habits[idx]);
});

document.getElementById('prevBtn').addEventListener('click', (e) => {
  if (habits.length === 0) return;
  idx = (idx - 1 + habits.length) % habits.length;
  renderCard(habits[idx]);
});
async function checkCurrent() {
  if (habits.length === 0) return;
  const current = habits[idx];
  try {
    if (!useLocal) {
      const res = await fetch(`/api/habits/${current.id}/checkin`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error');
        return;
      }
      const remaining = data.remaining || [];
      habits = remaining;
      if (habits.length === 0) {
        idx = 0;
        document.getElementById('cardWrapper').innerHTML = '';
        document.getElementById('controls').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        return;
      }
      if (idx >= habits.length) idx = 0;
      renderCard(habits[idx]);
      return;
    }

    // Local checkin logic (mirrors server-side usecase)
    const raw = window.localStorage.getItem(STORAGE_KEY);
    let all = [];
    try { all = JSON.parse(raw || '[]'); } catch (e) { all = []; }
    const habit = all.find(h => h.id === current.id);
    if (!habit) { alert('Habit not found'); return; }

    const today = new Date().toISOString().split('T')[0];
    const lastCheckDate = habit.last_check ? new Date(habit.last_check).toISOString().split('T')[0] : null;
    if (today === lastCheckDate) { alert('Habit already checked in today'); return; }
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    if (lastCheckDate === yesterdayDate) {
      habit.streak = (habit.streak || 0) + 1;
    } else {
      habit.streak = 1;
    }
    habit.last_check = today;
    // persist
    const updatedAll = all.map(h => h.id === habit.id ? habit : h);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAll));
    const remaining = updatedAll.filter(h => h.last_check !== today);
    habits = remaining;
    if (habits.length === 0) {
      idx = 0;
      document.getElementById('cardWrapper').innerHTML = '';
      document.getElementById('controls').style.display = 'none';
      document.getElementById('emptyState').style.display = 'block';
      return;
    }
    if (idx >= habits.length) idx = 0;
    renderCard(habits[idx]);
  } catch (err) {
    alert(err.message);
  }
}

Array.from(document.getElementsByClassName('habit-card')).forEach(card => {
  card.addEventListener('click', checkCurrent);
  card.addEventListener('keyup', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') checkCurrent(); });
});

load();
