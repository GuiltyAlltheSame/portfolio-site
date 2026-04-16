import { supabase } from './db.js';

/***** 1. вывод списка *****/
async function loadReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) { console.error(error); return; }

  const list = document.getElementById('reviews-list');
  if (!list) return;                 // секция не открыта
  list.innerHTML = '';

  data.forEach(r => {
    list.insertAdjacentHTML(
      'beforeend',
      `<li class="review-item">
        <b>${escapeHtml(r.name)}</b>
        <span class="stars">${'★'.repeat(r.rating)}</span>
        <p>${escapeHtml(r.comment)}</p>
       </li>`
    );
  });
}

/***** 2. сохранение *****/
async function sendReview(form) {
  const fd = new FormData(form);
  const payload = {
    name:    fd.get('name').trim(),
    comment: fd.get('comment').trim(),
    rating:  +fd.get('rating') || 0
  };

  if (!payload.name || !payload.comment || payload.rating < 1) {
    alert('Заполни все поля и выбери ≥1 звезду'); return;
  }

  const { error } = await supabase.from('reviews').insert([{ ...payload, approved:false }]);
  if (error) { alert('Ошибка: ' + error.message); return; }

  form.reset();
  loadReviews();
}

/***** 3. вешаем события *****/
document.addEventListener('DOMContentLoaded', () => {
  /* форма */
  const form = document.getElementById('review-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault(); sendReview(e.target);
  });

  /* первый вывод */
  loadReviews();
});

/* простейший XSS-escape */
function escapeHtml(str){
  return str.replace(/[&<>"']/g,ch=>(
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
