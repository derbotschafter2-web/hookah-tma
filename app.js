// 1. ПОДКЛЮЧЕНИЕ К SUPABASE
const SUPABASE_URL = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM загружен');
  
  // Элемент фона
  const appBg = document.getElementById('app-bg');
  if (appBg) {
    appBg.style.backgroundImage = "url('plan.png')";
    console.log('✅ Фон установлен');
  }

  // 3. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
  const tabs = document.querySelectorAll('.tabs button');
  const pages = document.querySelectorAll('.page');
  
  console.log('📑 Найдено вкладок:', tabs.length);
  console.log('📄 Найдено страниц:', pages.length);

  tabs.forEach((btn, index) => {
    console.log(`Кнопка ${index}:`, btn.id);
    btn.addEventListener('click', () => {
      console.log('🔘 Клик по кнопке:', btn.id);
      
      // Убираем active у всех кнопок
      tabs.forEach(b => b.classList.remove('active'));
      
      // Скрываем все страницы
      pages.forEach(p => {
        p.classList.remove('active');
        p.classList.add('hidden');
        console.log('Скрыта страница:', p.id);
      });
      
      // Делаем активной нажатую кнопку
      btn.classList.add('active');
      
      // Показываем нужную страницу
      const targetId = btn.id.replace('tab-', 'page-');
      const targetPage = document.getElementById(targetId);
      
      console.log('Целевая страница:', targetId, targetPage);
      
      if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
        console.log('✅ Показана страница:', targetId);
      }
      
      // Меняем фон
      if (targetId === 'page-map') {
        appBg.style.backgroundImage = "url('plan.png')";
      } else {
        appBg.style.backgroundImage = "url('bg.png')";
      }
    });
  });

  // Запускаем загрузку данных
  loadTables();
  loadMixes();
});

// 4. КООРДИНАТЫ СТОЛОВ
const tablePositions = {
  5: [22, 22], 4: [22, 34], 3: [22, 46], 2: [22, 58], 1: [22, 70], 17: [14, 86],
  15: [78, 22], 14: [78, 34], 13: [78, 46], 12: [78, 58], 11: [78, 70], 16: [86, 86],
  10: [50, 28], 9: [50, 40], 8: [50, 52], 7: [50, 64], 6: [50, 86]
};

// 5. ОТРИСОВКА СТОЛОВ
function renderTables(tables) {
  const layer = document.getElementById('tables-layer');
  if (!layer) {
    console.error('❌ Не найден элемент tables-layer');
    return;
  }
  layer.innerHTML = '';

  tables.forEach(t => {
    const pos = tablePositions[t.number];
    if (!pos) return;
    
    const [left, top] = pos;
    const marker = document.createElement('div');
    marker.className = `table-marker status-${t.status}`;
    marker.style.left = `${left}%`;
    marker.style.top = `${top}%`;
    marker.innerHTML = `<div class="table-tint"></div><span class="smoke-icon">☁️</span>`;
    layer.appendChild(marker);
  });
}

// 6. ЗАГРУЗКА СТОЛОВ
async function loadTables() {
  console.log('🔄 Загрузка столов...');
  const { data, error } = await db.from('tables').select('*');
  
  if (error) {
    console.error('❌ Ошибка столов:', error);
    return;
  }
  
  if (data) {
    renderTables(data);
    console.log('✅ Загружено столов:', data.length);
  }
}

// 7. ПОДПИСКА
db.channel('tables_realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadTables)
  .subscribe();

// 8. ЗАГРУЗКА МИКСОВ
async function loadMixes() {
  console.log('🔄 Загрузка миксов...');
  const { data, error } = await db.from('mixes').select('*');
  const list = document.getElementById('mixes-list');
  
  if (error) {
    console.error('❌ Ошибка миксов:', error);
    if (list) list.innerHTML = '<p style="color:#e74c3c; padding:20px;">Ошибка загрузки</p>';
    return;
  }
  
  if (list) {
    if (data && data.length > 0) {
      list.innerHTML = data.map(m => {
        const imageName = m.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
        return `
        <div class="mix-item" style="background-image: url('mixes/${imageName}.jpg')">
          <div class="mix-overlay"></div>
          <div class="mix-content">
            <div class="mix-name">${m.name}</div>
            <div class="mix-desc">${m.description}</div>
          </div>
        </div>`;
      }).join('');
      console.log('✅ Загружено миксов:', data.length);
    } else {
      list.innerHTML = '<p style="color:#666; padding:20px;">Список пуст</p>';
    }
  }
}

console.log('🚀 Hookah Map запущен!');
