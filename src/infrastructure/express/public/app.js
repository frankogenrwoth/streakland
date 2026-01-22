let habits = [];
let idx = 0;

async function fetchHabits() {
  const res = await fetch('/api/habits');
  return res.json();
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
  const res = await fetch('/api/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
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
    const res = await fetch(`/api/habits/${current.id}/checkin`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Error');
      return;
    }
    if (data.cleared) {
      habits = [];
      idx = 0;
      document.getElementById('cardWrapper').innerHTML = '';
      document.getElementById('controls').style.display = 'none';
      document.getElementById('emptyState').style.display = 'block';
      return;
    }

    habits.splice(idx, 1);
    if (habits.length === 0) {
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
