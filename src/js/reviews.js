import { supabase } from './db.js';
import { setFormStatus } from './form-status.js';
import {
  isTurnstileConfigured,
  requestTurnstileToken,
  resetTurnstile
} from './ui/turnstile.js';

async function verifyTurnstile(action) {
  if (!isTurnstileConfigured()) return;

  setFormStatus('SECURITY', 'VERIFYING', 'pending');
  const token = await requestTurnstileToken(action);
  const response = await fetch('/api/verify-turnstile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token, action })
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.ok !== true) {
    throw new Error(result.error || 'Verification failed.');
  }
}

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
  const submitButton = form.querySelector('[type="submit"]');

  if (String(fd.get('company') || '').trim()) {
    form.reset();
    setFormStatus('REVIEW', 'RECEIVED', 'success');
    return;
  }

  const payload = {
    name:    fd.get('name').trim(),
    comment: fd.get('comment').trim(),
    rating:  +fd.get('rating') || 0
  };

  if (!payload.name || !payload.comment || payload.rating < 1) {
    setFormStatus('REVIEW', 'CHECK FIELDS', 'error');
    return;
  }

  submitButton?.setAttribute('disabled', 'true');
  setFormStatus('REVIEW', 'SENDING', 'pending');

  try {
    await verifyTurnstile('review');
    setFormStatus('REVIEW', 'SENDING', 'pending');

    const { error } = await supabase.from('reviews').insert([{ ...payload, approved:false }]);
    if (error) throw error;

    form.reset();
    setFormStatus('REVIEW', 'AWAITING APPROVAL', 'success');
    loadReviews();
  } catch (error) {
    console.error('Review submit error:', error);
    setFormStatus('REVIEW', 'ERROR', 'error');
  } finally {
    if (isTurnstileConfigured()) {
      resetTurnstile('review');
    }
    submitButton?.removeAttribute('disabled');
  }
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
