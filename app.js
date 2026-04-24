// 1. ПОДКЛЮЧЕНИЕ К БАЗЕ
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

// 3. КООРДИНАТЫ (Те же самые, карта не ломается)
const tablePositions = {
  5: [60, 85], 4: [60, 165], 3: [60, 245], 2: [60, 325], 1: [60, 405], 17: [60, 570],
  15: [340, 85], 14: [340, 165], 13: [340, 245], 12: [340, 325], 11: [340, 405], 16: [340, 570],
  10: [200, 125], 9: [200, 225], 8: [200, 325], 7: [200, 425], 6: [200, 600]
};

// 4. ОТРИСОВКА СТОЛОВ (С эффектом дыма и скрытия)
function renderTables(tables) {
  const layer = document.getElementById('tables-layer');
  layer.innerHTML = '';

  tables.forEach(t => {
    const pos = tablePositions[t.number];
    if (!pos) return;
    const [cx, cy] = pos;

    // Группа стола
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", `table-group status-${t.status}`);
    g.setAttribute("transform", `translate(${cx}, ${cy})`);

    // 1. Стол (Фон)
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", -28); rect.setAttribute("y", -28);
    rect.setAttribute("width", 56); rect.setAttribute("height", 56);
    rect.setAttribute("rx", 6);
    rect.setAttribute("class", "table-rect");

    // 2. Растение 🌿 (Всегда на столе)
    const plant = document.createElementNS("http://www.w3.org/2000/svg", "text");
    plant.textContent = '🌿';
    plant.setAttribute("font-size", "14px");
    plant.setAttribute("text-anchor", "middle");
    plant.setAttribute("y", "-6");
    plant.setAttribute("class", "plant-icon");

    // 3. Номер (Исчезает при брони)
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.textContent = t.number;
    text.setAttribute("class", "table-number");
    text.setAttribute("y", "16");

    // 4. Дымовое облако ☁️ (Появляется только когда занят)
    const smoke = document.createElementNS("http://www.w3.org/2000/svg", "text");
    smoke.textContent = '☁️';
    smoke.setAttribute("font-size", "40px"); // Большой размер для густого дыма
    smoke.setAttribute("text-anchor", "middle");
    smoke.setAttribute("dominant-baseline", "middle");
    smoke.setAttribute("class", "smoke-cloud");

    g.appendChild(rect);
    g.appendChild(plant);
    g.appendChild(text);
    g.appendChild(smoke); // Дым всегда поверх
    layer.appendChild(g);
  });
}

// 5. ЗАГРУЗКА
async function loadTables() {
  const { data } = await supabase.from('tables').select('*');
  renderTables(data);
}

supabase.channel('tables_realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadTables)
  .subscribe();

// Миксы (без изменений)
async function loadMixes() {
  const { data } = await supabase.from('mixes').select('*');
  const list = document.getElementById('mixes-list');
  list.innerHTML = data.map(m => 
    `<div class="mix-item"><b>${m.name}</b><br>${m.description}</div>`
  ).join('');
}

loadTables();
loadMixes();
