const SUPABASE_URL = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.Telegram.WebApp.ready();
window.Telegram.WebApp.expand();

// Начальный фон
document.getElementById('app-bg').style.backgroundImage = "url('plan.png')";

// Переключение вкладок
window.showTab = function(tabName) {
  // Скрываем все страницы
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.backgroundImage = 'none';
  });
  
  // Деактивируем кнопки
  document.querySelectorAll('.tabs button').forEach(b => {
    b.classList.remove('active');
  });
  
  // Показываем нужную страницу
  const page = document.getElementById('page-' + tabName);
  page.classList.add('active');
  
  // Фон для вкладки Миксы
  if (tabName === 'mixes') {
    page.style.backgroundImage = "url('bg.png')";
    page.style.backgroundSize = 'cover';
    page.style.backgroundPosition = 'center';
  }
  
  // Активируем кнопку
  event.target.classList.add('active');
  
  console.log('Вкладка:', tabName);
};

// Загрузка миксов
async function loadMixes() {
  console.log('Загрузка миксов...');
  const { data } = await db.from('mixes').select('*');
  
  if (data && data.length > 0) {
    const list = document.getElementById('mixes-list');
    list.innerHTML = data.map(m => {
      const imgName = m.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
      return `
        <div class="mix-item" style="background-image: url('mixes/${imgName}.jpg')">
          <div class="mix-overlay"></div>
          <div class="mix-content">
            <div class="mix-name">${m.name}</div>
            <div class="mix-desc">${m.description}</div>
          </div>
        </div>
      `;
    }).join('');
    console.log('Миксов:', data.length);
  }
}

// Запуск
loadMixes();
