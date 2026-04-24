// 1. ПОДКЛЮЧЕНИЕ
const SUPABASE_URL = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tg = window.Telegram.WebApp;
tg.ready();

// 2. ВКЛАДКИ
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
    btn.classList.add('active');
    const target = document.getElementById(btn.id.replace('tab-', 'page-'));
    target.classList.remove('hidden');
    target.classList.add('active');
  });
});

// 3. КООРДИНАТЫ СТОЛОВ (X%, Y%) - рассчитаны под твой план
const tablePositions = {
  // Левая колонка
  5: [22, 22], 4: [22, 34], 3: [22, 46], 2: [22, 58], 1: [22, 70], 17: [14, 86],
  // Правая колонка
  15: [78, 22], 14: [78, 34], 13: [78, 46], 12: [78, 58], 11: [78, 70], 16: [86, 86],
  // Центральная колонка
  10: [50, 28], 9: [50, 40], 8: [50, 52], 7: [50, 64], 6: [50, 86]
};

// 4. ОТРИСОВКА МАРКЕРОВ ПОВЕРХ КАРТИНКИ
function renderTables(tables) {
  const overlay = document.getElementById('tables-overlay');
  overlay.innerHTML = '';

  tables.forEach(t => {
    const pos = tablePositions[t.number];
    if (!pos) return;
    const [left, top] = pos;

    const marker = document.createElement('div');
    marker.className = `table-marker status-${t.status}`;
    marker.style.left = `${left}%`;
    marker.style.top = `${top}%`;

    // Внутренняя структура маркера
    marker.innerHTML = `
      <div class="table-tint"></div>
      <span class="table-number">${t.number}</span>
      <span class="smoke-icon">☁️</span>
    `;

    overlay.appendChild(marker);
  });
}

// 5. ЗАГРУЗКА ДАННЫХ
async function loadTables() {
  const { data, error } = await db.from('tables').select('*');
  if (error) console.error('Ошибка загрузки:', error);
  if (data) renderTables(data);
}

// Подписка на изменения в реальном времени
db.channel('tables_realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadTables)
  .subscribe();

// Миксы
async function loadMixes() {
  const { data } = await db.from('mixes').select('*');
  const list = document.getElementById('mixes-list');
  if (data) {
    list.innerHTML = data.map(m => 
      `<div class="mix-item"><b>${m.name}</b><br>${m.description}</div>`
    ).join('');
  }
}

loadTables();
loadMixes();
