// 1. ПОДКЛЮЧЕНИЕ К SUPABASE
const SUPABASE_URL = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Элемент фона
const appBg = document.getElementById('app-bg');

// 2. УСТАНОВКА ФОНА ПРИ ЗАГРУЗКЕ
appBg.style.backgroundImage = "url('plan.png')";

// 3. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
const tabs = document.querySelectorAll('.tabs button');
const pages = document.querySelectorAll('.page');

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    // Убираем active у всех кнопок
    tabs.forEach(b => b.classList.remove('active'));
    
    // Скрываем все страницы
    pages.forEach(p => {
      p.classList.remove('active');
      p.classList.add('hidden');
    });
    
    // Делаем активной нажатую кнопку
    btn.classList.add('active');
    
    // Показываем нужную страницу
    const targetId = btn.id.replace('tab-', 'page-');
    const targetPage = document.getElementById(targetId);
    
    if (targetPage) {
      targetPage.classList.remove('hidden');
      targetPage.classList.add('active');
    }
    
    // Меняем фон в зависимости от вкладки
    if (targetId === 'page-map') {
      appBg.style.backgroundImage = "url('plan.png')";
    } else {
      appBg.style.backgroundImage = "url('bg.png')";
    }
  });
});

// 4. КООРДИНАТЫ СТОЛОВ (X%, Y%)
const tablePositions = {
  // Левая колонка
  5: [22, 22], 4: [22, 34], 3: [22, 46], 2: [22, 58], 1: [22, 70], 17: [14, 86],
  // Правая колонка
  15: [78, 22], 14: [78, 34], 13: [78, 46], 12: [78, 58], 11: [78, 70], 16: [86, 86],
  // Центральная колонка
  10: [50, 28], 9: [50, 40], 8: [50, 52], 7: [50, 64], 6: [50, 86]
};

// 5. ОТРИСОВКА СТОЛОВ
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

// 6. ЗАГРУЗКА СТОЛОВ
async function loadTables() {
  const { data, error } = await db.from('tables').select('*');
  
  if (error) {
    console.error('❌ Ошибка загрузки столов:', error);
    return;
  }
  
  if (data) {
    renderTables(data);
    console.log('✅ Загружено столов:', data.length);
  }
}

// 7. ПОДПИСКА НА ИЗМЕНЕНИЯ СТОЛОВ (REAL-TIME)
db.channel('tables_realtime')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'tables' 
  }, loadTables)
  .subscribe();

// 8. ЗАГРУЗКА МИКСОВ (С РАЗДЕЛЕНИЕМ НАЗВАНИЯ И ИНГРЕДИЕНТОВ)
async function loadMixes() {
  const { data, error } = await db.from('mixes').select('*');
  const list = document.getElementById('mixes-list');
  
  if (error) {
    console.error('❌ Ошибка загрузки миксов:', error);
    list.innerHTML = '<p style="text-align:center; color:#e74c3c; padding:20px;">Ошибка загрузки</p>';
    return;
  }
  
  if (data && data.length > 0) {
    list.innerHTML = data.map(m => `
      <div class="mix-item">
        <div class="mix-name">${m.name}</div>
        <div class="mix-desc">${m.description}</div>
      </div>
    `).join('');
    
    console.log('✅ Загружено миксов:', data.length);
  } else {
    list.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">Список пуст</p>';
  }
}

// 9. ЗАПУСК ПРИЛОЖЕНИЯ
loadTables();
loadMixes();

console.log('🚀 Hookah Map запущен!');
