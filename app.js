// Подключение к Supabase
const SUPABASE_URL = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

console.log('🚀 Hookah Map запущен!');

// Фон
const appBg = document.getElementById('app-bg');
if (appBg) {
  appBg.style.backgroundImage = "url('plan.png')";
}

// Переключение вкладок
const tabs = document.querySelectorAll('.tabs button');
const pages = document.querySelectorAll('.page');

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    console.log('Клик по вкладке:', btn.id);
    
    tabs.forEach(b => b.classList.remove('active'));
    pages.forEach(p => {
      p.classList.remove('active');
      p.classList.add('hidden');
    });
    
    btn.classList.add('active');
    
    const targetId = btn.id.replace('tab-', 'page-');
    const targetPage = document.getElementById(targetId);
    
    if (targetPage) {
      targetPage.classList.remove('hidden');
      targetPage.classList.add('active');
      console.log('Показана страница:', targetId);
    }
    
    if (targetId === 'page-map') {
      appBg.style.backgroundImage = "url('plan.png')";
    } else {
      appBg.style.backgroundImage = "url('bg.png')";
    }
  });
});

// Координаты столов
const tablePositions = {
  5: [22, 22], 4: [22, 34], 3: [22, 46], 2: [22, 58], 1: [22, 70], 17: [14, 86],
  15: [78, 22], 14: [78, 34], 13: [78, 46], 12: [78, 58], 11: [78, 70], 16: [86, 86],
  10: [50, 28], 9: [50, 40], 8: [50, 52], 7: [50, 64], 6: [50, 86]
};

// Отрисовка столов
function renderTables(tables) {
  const layer = document.getElementById('tables-layer');
  if (!layer) return;
  
  layer.innerHTML = '';
  tables.forEach(t => {
    const pos = tablePositions[t.number];
    if (!pos) return;
    
    const [left, top] = pos;
    const marker = document.createElement('div');
    marker.className = `table-marker status-${t.status}`;
    marker.style.left = `${left}%`;
    marker.style.top = `${top}%`;
    marker.innerHTML = '<div class="table-tint"></div><span class="smoke-icon">☁️</span>';
    layer.appendChild(marker);
  });
  console.log('✅ Столов загружено:', tables.length);
}

// Загрузка столов
async function loadTables() {
  try {
    const { data, error } = await db.from('tables').select('*');
    if (error) throw error;
    if (data) renderTables(data);
  } catch (err) {
    console.error('❌ Ошибка столов:', err);
  }
}

// Подписка на изменения
db.channel('tables_realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadTables)
  .subscribe();

// Загрузка миксов
async function loadMixes() {
  console.log('🔄 Загрузка миксов...');
  try {
    const { data, error } = await db.from('mixes').select('*');
    const list = document.getElementById('mixes-list');
    
    if (error) throw error;
    
    if (list) {
      if (data && data.length > 0) {
        list.innerHTML = data.map(m => {
          const imageName = m.name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');
          
          return `
            <div class="mix-item" style="background-image: url('mixes/${imageName}.jpg')">
              <div class="mix-overlay"></div>
              <div class="mix-content">
                <div class="mix-name">${m.name}</div>
                <div class="mix-desc">${m.description}</div>
              </div>
            </div>
          `;
        }).join('');
        console.log('✅ Миксов загружено:', data.length);
      } else {
        list.innerHTML = '<p style="color:#666; padding:20px; text-align:center;">Список пуст</p>';
      }
    }
  } catch (err) {
    console.error('❌ Ошибка миксов:', err);
  }
}

// Запуск
loadTables();
loadMixes();
