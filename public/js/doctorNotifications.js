document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.startsWith('/doctor')) return;
  
    const io      = window.io();                      
    const doctorId= document.body.dataset.doctorId;
    io.emit('registerDoctor', doctorId);
  
    const list  = document.getElementById('notifications');
    const sound = document.getElementById('alert-sound');
  
    function renderCall(id, room, time) {
      const div = document.createElement('div');
      div.className = 'card-panel teal lighten-4 flex-space';
      div.dataset.id = id;
      div.innerHTML  = `
        <span>Срочный вызов в палату ${room} (${time})</span>
        <button class="btn-flat waves-effect" title="Закрыть">
          <i class="material-icons">check</i>
        </button>`;
      list.prepend(div);
    }
  
    io.on('doctorCall', data => {
      const tm = new Date(data.time).toLocaleTimeString();
      renderCall(data.dbId, data.room_id, tm);  
      sound.play();
    });
  
    list.addEventListener('click', async e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const card = btn.closest('[data-id]');
      const id   = card.dataset.id;
  
      const r = await fetch('/doctor/close-call/' + id, { method: 'POST' });
      if ((await r.json()).ok) card.remove();
    });
  });
  