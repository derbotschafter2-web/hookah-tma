// 1. ПОДКЛЮЧЕНИЕ К БАЗЕ
const SUPABASE_URL = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. ПАРОЛЬ (поменяй на свой!)
const ADMIN_PASSWORD = '12345';

// 3. ФУНКЦИИ
window.checkPassword = function() {
  const input = document.getElementById('admin-pass').value;
  const errorMsg = document.getElementById('error-msg');
  
  if (input === ADMIN_PASSWORD) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    loadTables();
  } else {
    errorMsg.classList.remove('hidden');
  }
};

window.logout = function() {
  location.reload();
};

async function loadTables() {
  const { data, error } = await db.from('tables').select('*').order('number');
  if (error) {
    alert('❌ Ошибка загрузки: ' + error.message);
    return;
  }
  renderAdminGrid(data);
}

function renderAdminGrid(tables) {
  const container = document.getElementById('tables-admin');
  container.innerHTML = '';

  tables.forEach(t => {
    const card = document.createElement('div');
    card.className = `table-card status-${t.status}`;
    
    card.innerHTML = `
      <strong>Стол ${t.number}</strong>
      <select onchange="updateStatus('${t.id}', this.value)">
        <option value="free" ${t.status === 'free' ? 'selected' : ''}>🟢 Свободен</option>
        <option value="reserved" ${t.status === 'reserved' ? 'selected' : ''}>🟡 Забронирован</option>
        <option value="occupied" ${t.status === 'occupied' ? 'selected' : ''}>🔴 Занят</option>
      </select>
    `;
    
    container.appendChild(card);
  });
}

window.updateStatus = async function(tableId, newStatus) {
  const { error } = await db.from('tables').update({ status: newStatus }).eq('id', tableId);
  
  if (error) {
    alert('❌ Ошибка: ' + error.message);
  } else {
    console.log(`✅ Стол ${tableId} → ${newStatus}`);
  }
};
