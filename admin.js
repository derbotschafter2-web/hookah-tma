// 1. Подключение к базе
const SUPABASE_URL = 'https://stwgqinqdrbbxgzhsyog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vjEzyQgNLOd0Cw_QK6PzHg_S8l60xIU';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Пароль для входа (поменяй на свой!)
const ADMIN_PASSWORD = 'hookah_admin_2026';

// Ждём, пока страница полностью загрузится
document.addEventListener('DOMContentLoaded', () => {
  
  // Функция входа
  window.checkPassword = function() {
    const input = document.getElementById('admin-pass').value;
    const errorMsg = document.getElementById('error-msg');
    
    if (input === ADMIN_PASSWORD) {
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('admin-panel').classList.remove('hidden');
      loadTables(); // Загружаем столы только после успешного входа
    } else {
      errorMsg.style.display = 'block';
    }
  };

  // Функция выхода
  window.logout = function() {
    location.reload(); // Перезагружаем страницу = выход из сессии
  };

  // Загрузка столов
  async function loadTables() {
    const { data, error } = await supabase.from('tables').select('*').order('number');
    if (error) return alert('❌ Ошибка загрузки: ' + error.message);
    renderAdminGrid(data);
  }

  // Отрисовка карточек и привязка изменений
  function renderAdminGrid(tables) {
    const container = document.getElementById('tables-admin');
    container.innerHTML = '';

    tables.forEach(t => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <strong>Стол ${t.number}</strong>
        <select class="status-select" data-id="${t.id}" style="margin-top:10px; width:100%; padding:8px; border-radius:6px; border:1px solid #444; background:#2a2a2a; color:#fff;">
          <option value="free" ${t.status==='free'?'selected':''}>🟢 Свободен</option>
          <option value="reserved" ${t.status==='reserved'?'selected':''}>🟡 Забронирован</option>
          <option value="occupied" ${t.status==='occupied'?'selected':''}>🔴 Занят</option>
        </select>
      `;
      container.appendChild(card);
    });

    // Навешиваем событие на каждый выпадающий список
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const tableId = e.target.dataset.id;
        const newStatus = e.target.value;
        const btn = e.target;
        
        btn.disabled = true; // Блокируем, пока идёт сохранение
        const { error } = await supabase.from('tables').update({ status: newStatus }).eq('id', tableId);
        
        if (!error) {
          btn.disabled = false;
          // Можно добавить лёгкое уведомление вместо alert:
          console.log(`✅ Стол ${tableId} обновлён на ${newStatus}`);
        } else {
          alert(`❌ Ошибка сохранения: ${error.message}`);
          btn.disabled = false;
        }
      });
    });
  }
});