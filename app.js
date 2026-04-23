// 1. НАСТРОЙКИ
const supabaseUrl = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const supabaseKey = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. TELEGRAM
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// 3. ВКЛАДКИ
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    const target = btn.id.replace('tab-', 'page-');
    document.getElementById(target).classList.remove('hidden');
  });
});

// 4. СТОЛЫ
async function loadTables() {
  const { data } = await supabaseClient.from('tables').select('*').order('number');
  const grid = document.getElementById('tables-grid');
  grid.innerHTML = '';
  
  data.forEach(t => {
    const div = document.createElement('div');
    div.className = `table-card status-${t.status}`;
    div.textContent = `Стол ${t.number}`;
    grid.appendChild(div);
  });
}

// 5. REAL-TIME
supabaseClient.channel('tables_realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadTables)
  .subscribe();

// 6. МИКСЫ
async function loadMixes() {
  const { data } = await supabaseClient.from('mixes').select('*');
  const list = document.getElementById('mixes-list');
  list.innerHTML = data.map(m => 
    `<div class="mix-item"><b>${m.name}</b><br>${m.description}</div>`
  ).join('');
}

// ЗАПУСК
loadTables();
loadMixes();
