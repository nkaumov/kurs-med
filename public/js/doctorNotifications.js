document.addEventListener('DOMContentLoaded', () => {
    if (!location.pathname.startsWith('/doctor')) return;
  
    const socket   = io();
    const doctorId = document.querySelector('[data-doctor-id]').dataset.doctorId;
    socket.emit('registerDoctor', doctorId);
  
    const list  = document.getElementById('notifications');
    const sound = document.getElementById('alert-sound');
  
    function addCard({ id, room, time }) {
      const div = document.createElement('div');
      div.className = 'card-panel teal lighten-4 flex-space';
      div.dataset.id = id;
      div.innerHTML  = `
        <span>
          Палата&nbsp;${room}<br class="hide-on-med-and-up">
          <small>${time}</small>
        </span>
        <button class="btn-flat waves-effect" title="Закрыть">
          <i class="material-icons">check</i>
        </button>`;
      list.prepend(div);
    }
  
    socket.on('doctorCall', data => {
      const t = new Date(data.time).toLocaleTimeString();
      addCard({ id: data.dbId, room: data.room_id, time: t });
      sound.play();
    });
  
    list.addEventListener('click', async (e) => {
      const btn  = e.target.closest('button');
      if (!btn) return;
  
      const card = btn.closest('[data-id]');
      const id   = card.dataset.id;
  
      const r = await fetch('/doctor/close-call/' + id, { method:'POST' });
      if ((await r.json()).ok) card.remove();
    });
  });
  