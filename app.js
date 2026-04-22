const supabaseUrl = 'ТУТ_SUPABASE_URL';
const supabaseKey = 'ТУТ_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Переключение вкладок
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    const target = btn.id.replace('tab-', 'page-');
    document.getElementById(target).classList.remove('hidden');
  });
});

// Загрузка и обновление столов в реальном времени
async function loadTables() {
  const { data } = await supabase.from('tables').select('*').order('number');
  renderTables(data);
}

function renderTables(tables) {
  const grid = document.getElementById('tables-grid');
  grid.innerHTML = '';
  tables.forEach(t => {
    const div = document.createElement('div');
    div.className = `table-card status-${t.status}`;
    div.textContent = `Стол ${t.number}`;
    grid.appendChild(div);
  });
}

// Подписка на изменения
const channel = supabase.channel('tables_realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadTables)
  .subscribe();

// Загрузка миксов
async function loadMixes() {
  const { data } = await supabase.from('mixes').select('*');
  const list = document.getElementById('mixes-list');
  list.innerHTML = data.map(m => `<div class="mix-item"><b>${m.name}</b><br>${m.description} — ${m.price}₽</div>`).join('');
}

loadTables();
loadMixes();