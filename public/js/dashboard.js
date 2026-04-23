let users = [];
let selectedMonth = '';
let selectedDay = '';

const today = new Date();
const todayM = today.getMonth() + 1;
const todayD = today.getDate();

// custom dropdowns

const months = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

function populateDropdowns() {
  const monthDD = document.getElementById('month-dropdown');
  months.forEach((m, i) => {
    const val = String(i + 1).padStart(2, '0');
    const el = document.createElement('div');
    el.className = 'cs-option';
    el.textContent = m;
    el.dataset.value = val;
    el.onclick = () => selectOption('month-select', val, m);
    monthDD.appendChild(el);
  });

  const dayDD = document.getElementById('day-dropdown');
  for (let d = 1; d <= 31; d++) {
    const val = String(d).padStart(2, '0');
    const el = document.createElement('div');
    el.className = 'cs-option';
    el.textContent = d;
    el.dataset.value = val;
    el.onclick = () => selectOption('day-select', val, d);
    dayDD.appendChild(el);
  }
}

function toggleDropdown(id) {
  const wrap = document.getElementById(id);
  const dd = wrap.querySelector('.cs-dropdown');
  const trigger = wrap.querySelector('.cs-trigger');
  const isOpen = dd.classList.contains('open');

  closeAllDropdowns();

  if (!isOpen) {
    dd.classList.add('open');
    trigger.classList.add('active');
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.cs-dropdown').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.cs-trigger').forEach(t => t.classList.remove('active'));
}

function daysInMonth(month) {
  const days30 = ['04','06','09','11'];
  if (month === '02') return 29;
  if (days30.includes(month)) return 30;
  return 31;
}

function refreshDays() {
  const dayDD = document.getElementById('day-dropdown');
  const max = selectedMonth ? daysInMonth(selectedMonth) : 31;

  dayDD.innerHTML = '';
  for (let d = 1; d <= max; d++) {
    const val = String(d).padStart(2, '0');
    const el = document.createElement('div');
    el.className = 'cs-option';
    el.textContent = d;
    el.dataset.value = val;
    el.onclick = () => selectOption('day-select', val, d);
    dayDD.appendChild(el);
  }

  if (selectedDay && parseInt(selectedDay) > max) {
    selectedDay = '';
    document.getElementById('day-label').textContent = 'Day';
    document.getElementById('day-label').style.color = '';
  } else if (selectedDay) {
    dayDD.querySelectorAll('.cs-option').forEach(o => {
      o.classList.toggle('selected', o.dataset.value === selectedDay);
    });
  }
}

function selectOption(selectId, value, label) {
  if (selectId === 'month-select') {
    selectedMonth = value;
    document.getElementById('month-label').textContent = label;
    document.getElementById('month-label').style.color = 'var(--text)';
    refreshDays();
  } else {
    selectedDay = value;
    document.getElementById('day-label').textContent = label;
    document.getElementById('day-label').style.color = 'var(--text)';
  }

  document.querySelectorAll(`#${selectId} .cs-option`).forEach(o => {
    o.classList.toggle('selected', o.dataset.value === value);
  });

  closeAllDropdowns();
}

function getDob() {
  const year = document.getElementById('dob-year').value.trim();
  if (!selectedMonth || !selectedDay || !year) return null;
  return `${year}-${selectedMonth}-${selectedDay}`;
}

function clearDob() {
  selectedMonth = '';
  selectedDay = '';
  document.getElementById('month-label').textContent = 'Month';
  document.getElementById('month-label').style.color = '';
  document.getElementById('day-label').textContent = 'Day';
  document.getElementById('day-label').style.color = '';
  document.getElementById('dob-year').value = '';
  document.querySelectorAll('.cs-option').forEach(o => o.classList.remove('selected'));
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.custom-select')) closeAllDropdowns();
});

// load & render

async function load() {
  const res = await fetch('/api/users');
  users = await res.json();
  renderTable();
}

function isToday(dob) {
  const [y, m, d] = dob.split('-').map(Number);
  return m === todayM && d === todayD;
}

function formatDob(dob) {
  const [y, m, d] = dob.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderTable() {
  const q = document.getElementById('search').value.toLowerCase();
  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );

  document.getElementById('count-badge').textContent =
    `${users.length} ${users.length === 1 ? 'person' : 'people'}`;

  const tbody = document.getElementById('table-body');
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty"><span class="empty-icon">🎈</span>No results found.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const initial = u.username.charAt(0).toUpperCase();
    const bdayClass = isToday(u.dob) ? 'birthday-chip today' : 'birthday-chip';
    const bdayLabel = isToday(u.dob) ? '🎂 Today!' : formatDob(u.dob);
    return `
      <tr>
        <td><div class="user-cell"><div class="avatar">${initial}</div>${u.username}</div></td>
        <td>${u.email}</td>
        <td><span class="${bdayClass}">${bdayLabel}</span></td>
        <td><button class="del-btn" onclick="deleteUser('${u._id}')" title="Remove">✕</button></td>
      </tr>`;
  }).join('');
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = type;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 4000);
}

async function addUser() {
  const username = document.getElementById('username').value.trim();
  const email    = document.getElementById('email').value.trim();
  const dob      = getDob();

  if (!username || !email || !dob) {
    showToast('Please fill in all fields.', 'error'); return;
  }

  const btn = document.querySelector('.btn');
  btn.disabled = true; btn.textContent = 'Adding…';

  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, dob })
  });
  const data = await res.json();
  btn.disabled = false; btn.textContent = 'Add Customer';

  if (res.ok) {
    showToast(`✅ ${username} added successfully!`, 'success');
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    clearDob();
    load();
  } else {
    showToast(`❌ ${data.error}`, 'error');
  }
}

async function deleteUser(id) {
  if (!confirm('Remove this customer?')) return;
  await fetch(`/api/users/${id}`, { method: 'DELETE' });
  load();
}

async function testCheck() {
  const btn = document.querySelector('.btn-test');
  btn.disabled = true; btn.textContent = 'Sending…';
  const res = await fetch('/api/test-birthday-check', { method: 'POST' });
  const data = await res.json();
  btn.disabled = false; btn.textContent = '⚡ Test Birthday Check Now';
  showToast(`Checked! ${data.sent ?? 0} email(s) sent for today's birthdays.`, 'success');
}

populateDropdowns();
load();