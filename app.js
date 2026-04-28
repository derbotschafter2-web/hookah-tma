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
    p.style.backgroundImage = 'none';
    p.style.backgroundSize = '';
    p.style.backgroundPosition = '';
  });
  
  // Убираем active у кнопок
  document.querySelectorAll('.tabs button').forEach(b => {
    b.classList.remove('active');
  });
  
  // Показываем нужную
  const page = document.getElementById('page-' + tabName);
  page.style.display = 'block';
  
  // Фон для миксов
  if (tabName === 'mixes') {
    page.style.backgroundImage = "url('bg.png')";
    page.style.backgroundSize = 'cover';
    page.style.backgroundPosition = 'center';
  }
  
  // Активируем кнопку
  event.target.classList.add('active');
  
  console.log('Показана вкладка:', tabName);
};

// Загрузка миксов
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
loadMixes();

// Активируем первую вкладку
document.querySelector('.tabs button').classList.add('active');
