const SUPABASE_URL = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Устанавливаем фон
const appBg = document.getElementById('app-bg');
appBg.style.backgroundImage = "url('plan.png')";

// Переключение вкладок
document.getElementById('tab-map').onclick = function() {
  setActiveTab('map');
};
document.getElementById('tab-mixes').onclick = function() {
  setActiveTab('mixes');
};
document.getElementById('tab-book').onclick = function() {
  setActiveTab('book');
};

function setActiveTab(tabName) {
  // Убираем active у всех кнопок
  document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
  // Скрываем все страницы
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
    page.classList.add('hidden');
  });
  
  // Активируем нужную кнопку
  document.getElementById('tab-' + tabName).classList.add('active');
  // Показываем нужную страницу
  const page = document.getElementById('page-' + tabName);
  page.classList.remove('hidden');
  page.classList.add('active');
  
  // Меняем фон
  if (tabName === 'map') {
    appBg.style.backgroundImage = "url('plan.png')";
  } else {
    appBg.style.backgroundImage = "url('bg.png')";
  }
}

// Остальной код (столы и миксы)
const tablePositions = {
  5: [22, 22], 4: [22, 34], 3: [22, 46], 2: [22, 58], 1: [22, 70], 17: [14, 86],
  15: [78, 22], 14: [78, 34], 13: [78, 46], 12: [78, 58], 11: [78, 70], 16: [86, 86],
  10: [50, 28], 9: [50, 40], 8: [50, 52], 7: [50, 64], 6: [50, 86]
};

function renderTables(tables) {
  const layer = document.getElementById('tables-layer');
  layer.innerHTML = '';
  tables.forEach(t => {
    const pos = tablePositions[t.number];
    if (!pos) return;
    const [left, top] = pos;
    const marker = document.createElement('div');
    marker.className = `table-marker status-${t.status}`;
    marker.style.left = left + '%';
    marker.style.top = top + '%';
    marker.innerHTML = '<div class="table-tint"></div><span class="smoke-icon">☁️</span>';
    layer.appendChild(marker);
  });
}

async function loadTables() {
  const { data } = await db.from('tables').select('*');
  if (data) renderTables(data);
}

db.channel('tables_realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadTables)
  .subscribe();

async function loadMixes() {
  const { data } = await db.from('mixes').select('*');
  const list = document.getElementById('mixes-list');
  if (data && data.length > 0) {
    list.innerHTML = data.map(m => {
      const imageName = m.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
      return `<div class="mix-item" style="background-image: url('mixes/${imageName}.jpg')">
        <div class="mix-overlay"></div>
        <div class="mix-content">
          <div class="mix-name">${m.name}</div>
          <div class="mix-desc">${m.description}</div>
        </div>
      </div>`;
    }).join('');
  }
}

loadTables();
loadMixes();
