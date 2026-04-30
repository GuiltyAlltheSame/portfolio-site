export function initClock() {
  const dateEl = document.getElementById('clock-date');
  const timeEl = document.getElementById('clock-time');

  if (!dateEl || !timeEl) return;

  function tick() {
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const date = `${d.getDate()}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;

    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';

    h = h % 12 || 12;
    const time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;

    dateEl.textContent = date;
    timeEl.textContent = time;
  }

  tick();
  setInterval(tick, 1000);
}