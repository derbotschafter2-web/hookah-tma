// 1. НАСТРОЙКИ (ВСТАВЬ СВОИ КЛЮЧИ СЮДА!)
const supabaseUrl = 'https://stwgqinqdrbbxgzhsyog.supabase.co'; // Твой URL
const supabaseKey = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU'; // Твой КЛЮЧ

// Создаем клиент (не меняй эту строку)
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. ИНИЦИАЛИЗАЦИЯ TELEGRAM
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// 3. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    const target = btn.id.replace('tab-', 'page-');
    document.getElementById(target).classList.remove('hidden');
  });
});

// 4. ЗАГРУЗКА СТОЛОВ
async function loadTables() {
  const { data } = await supabase.from('tables').select('*').order('number');
  const grid = document.getElementById('tables-grid');
  grid.innerHTML = ''; // Очищаем перед отрисовкой
  
  data.forEach(t => {
    const div = document.createElement('div');
    div.className = `table-card status-${t.status}`;
    div.textContent = `Стол ${t.number}`;
    grid.appendChild(div);
  });
}

// 5. ПОДПИСКА НА ИЗМЕНЕНИЯ (REAL-TIME)
supabase.channel('tables_realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadTables)
  .subscribe();

// 6. ЗАГРУЗКА МИКСОВ
async function loadMixes() {
  const { data } = await supabase.from('mixes').select('*');
  const list = document.getElementById('mixes-list');
  list.innerHTML = data.map(m => 
    `<div class="mix-item"><b>${m.name}</b><br>${m.description} — ${m.price}₽</div>`
  ).join('');
}

// ЗАПУСК
loadTables();
loadMixes();
