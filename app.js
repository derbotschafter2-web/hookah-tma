// 1. ПОДКЛЮЧЕНИЕ
const supabaseUrl = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const supabaseKey = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const tg = window.Telegram.WebApp;
tg.ready();

// 2. ВКЛАДКИ
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
    btn.classList.add('active');
    const target = document.getElementById(btn.id.replace('tab-', 'page-'));
    target.classList.remove('hidden');
    target.classList.add('active');
  });
});

// 3. КООРДИНАТЫ СТОЛОВ (X, Y) под твой макет
// Я расставил их точно по сетке 400x650
const tablePositions = {
  // Левая колонка
  5: [55, 80], 4: [55, 160], 3: [55, 240], 2: [55, 320], 1: [55, 400], 17: [55, 560],
  // Правая колонка
  15: [345, 80], 14: [345, 160], 13: [345, 240], 12: [345, 320], 11: [345, 400], 16: [345, 560],
  // Центральная колонка (сдвиги под диваны)
  10: [200, 110], 9: [200, 210], 8: [200, 310], 7: [200, 410], 6: [200, 600]
};

// 4. ОТРИСОВКА СТОЛОВ
function renderTables(tables) {
  const layer = document.getElementById('tables-layer');
  layer.innerHTML = ''; // Очистка перед перерисовкой

  tables.forEach(t => {
    const pos = tablePositions[t.number];
    if (!pos) return;

    const [cx, cy] = pos;
    
    // Группа SVG
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", `table-group status-${t.status}`);
    g.setAttribute("transform", `translate(${cx}, ${cy})`); // Перемещаем в нужное место

    // Стол (Прямоугольник)
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", -25); // Половина ширины влево
    rect.setAttribute("y", -15); // Половина высоты вверх
    rect.setAttribute("width", 50);
    rect.setAttribute("height", 30);
    rect.setAttribute("class", "table-rect");

    // Номер
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.textContent = t.number;
    text.setAttribute("class", "table-text");

    g.appendChild(rect);
    g.appendChild(text);
    layer.appendChild(g);
  });
}

// 5. ЗАГРУЗКА ДАННЫХ
async function loadTables() {
  const { data } = await supabase.from('tables').select('*');
  renderTables(data);
}

// Подписка на изменения (Realtime)
supabase.channel('tables_realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadTables)
  .subscribe();

// Миксы
async function loadMixes() {
  const { data } = await supabase.from('mixes').select('*');
  const list = document.getElementById('mixes-list');
  list.innerHTML = data.map(m => 
    `<div class="mix-item"><b>${m.name}</b><br>${m.description}</div>`
  ).join('');
}

loadTables();
loadMixes();
