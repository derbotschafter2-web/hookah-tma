// 1. ПОДКЛЮЧЕНИЕ
const SUPABASE_URL = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tg = window.Telegram.WebApp;
tg.ready();

// Элемент фона
const appBg = document.getElementById('app-bg');

// ✅ ФУНКЦИЯ СМЕНЫ ФОНА
function setBackground(type) {
  if (type === 'map') {
    appBg.style.backgroundImage = "url('plan.png')";
  } else {
    appBg.style.backgroundImage = "url('bg.png')";
  }
}

// 2. ВКЛАДКИ
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    // Сброс активных классов
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
    
    // Активация нажатой кнопки
    btn.classList.add('active');
    const targetId = btn.id.replace('tab-', 'page-');
    const target = document.getElementById(targetId);
    target.classList.remove('hidden');
    target.classList.add('active');

    // 🎨 Меняем фон
    if (targetId === 'page-map') {
      setBackground('map');
    } else {
      setBackground('other');
    }
  });
});

// 3. КООРДИНАТЫ СТОЛОВ
const tablePositions = {
  5: [22, 22], 4: [22, 34], 3: [22, 46], 2: [22, 58], 1: [22, 70], 17: [14, 86],
  15: [78, 22], 14: [78, 34], 13: [78, 46], 12: [78, 58], 11: [78, 70], 16: [86, 86],
  10: [50, 28], 9: [50, 40], 8: [50, 52], 7: [50, 64], 6: [50, 86]
};

// 4. ОТРИСОВКА
function renderTables(tables) {
  const layer = document.getElementById('tables-layer');
  layer.innerHTML = '';

  tables.forEach(t => {
    const pos = tablePositions[t.number];
    if (!pos) return;
    const [left, top] = pos;

    const marker = document.createElement('div');
    marker.className = `table-marker status-${t.status}`;
    marker.style.left = `${left}%`;
    marker.style.top = `${top}%`;

    marker.innerHTML = `
      <div class="table-tint"></div>
      <span class="smoke-icon">☁️</span>
    `;
    layer.appendChild(marker);
  });
}

// 5. ЗАГРУЗКА ДАННЫХ
async function loadTables() {
  const { data, error } = await db.from('tables').select('*');
  if (error) console.error('Ошибка:', error);
  if (data) renderTables(data);
}

db.channel('tables_realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadTables)
  .subscribe();

async function loadMixes() {
  const { data } = await db.from('mixes').select('*');
  const list = document.getElementById('mixes-list');
  if (data) {
    list.innerHTML = data.map(m => 
      `<div class="mix-item"><b>${m.name}</b><br>${m.description}</div>`
    ).join('');
  }
}

// 🚀 ПРИ ЗАГРУЗКЕ СТРАНИЦЫ: Сразу ставим фон карты
setBackground('map');
loadTables();
loadMixes();
