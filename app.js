const SUPABASE_URL = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.Telegram.WebApp.ready();

// Фон
document.getElementById('app-bg').style.backgroundImage = "url('plan.png')";

// Переключение вкладок
window.showTab = function(tabName) {
  // Скрываем все страницы
  document.querySelectorAll('.page').forEach(p => {
    p.style.display = 'none';
  });
  
  // Убираем active у кнопок
  document.querySelectorAll('.tabs button').forEach(b => {
    b.classList.remove('active');
  });
  
  // Показываем нужную
  document.getElementById('page-' + tabName).style.display = 'block';
  
  // Активируем кнопку
  event.target.classList.add('active');
  
  // Меняем фон
  if (tabName === 'map') {
    document.getElementById('app-bg').style.backgroundImage = "url('plan.png')";
  } else {
    document.getElementById('app-bg').style.backgroundImage = "url('bg.png')";
  }
  
  console.log('Показана вкладка:', tabName);
};

// Столы
const positions = {
  5: [22, 22], 4: [22, 34], 3: [22, 46], 2: [22, 58], 1: [22, 70], 17: [14, 86],
  15: [78, 22], 14: [78, 34], 13: [78, 46], 12: [78, 58], 11: [78, 70], 16: [86, 86],
  10: [50, 28], 9: [50, 40], 8: [50, 52], 7: [50, 64], 6: [50, 86]
};

async function loadTables() {
  const { data } = await db.from('tables').select('*');
  if (!data) return;
  
  const layer = document.getElementById('tables-layer');
  layer.innerHTML = '';
  
  data.forEach(t => {
    const pos = positions[t.number];
    if (!pos) return;
    
    const marker = document.createElement('div');
    marker.className = 'table-marker status-' + t.status;
    marker.style.left = pos[0] + '%';
    marker.style.top = pos[1] + '%';
    marker.innerHTML = '<div class="table-tint"></div><span class="smoke-icon">☁️</span>';
    layer.appendChild(marker);
  });
  
  console.log('Загружено столов:', data.length);
}

async function loadMixes() {
  console.log('Загрузка миксов...');
  const { data } = await db.from('mixes').select('*');
  if (!data) return;
  
  const list = document.getElementById('mixes-list');
  list.innerHTML = data.map(m => {
    const name = m.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    return `
      <div class="mix-item" style="background-image: url('mixes/${name}.jpg')">
        <div class="mix-overlay"></div>
        <div class="mix-content">
          <div class="mix-name">${m.name}</div>
          <div class="mix-desc">${m.description}</div>
        </div>
      </div>
    `;
  }).join('');
  
  console.log('Загружено миксов:', data.length);
}

// Запуск
loadTables();
loadMixes();

// Активируем первую вкладку
document.querySelector('.tabs button').classList.add('active');
