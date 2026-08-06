/***************************************************************************
 *   ADMIN PANEL                                                           *
 *   3 windows: Reviews | Messages | Password                               *
 *   guests defender, fast CRUD thru Supabase                         *
 ***************************************************************************/
import { supabase } from './db.js';

/* ——— guard: only who logged in ——— */
const { data: { session } } = await supabase.auth.getSession();
if (!session) location.href = '/';

/* ——— DOM refs ——— */
const el = {
  reviews : document.getElementById('reviews-list'),
  messages: document.getElementById('messages-list'),
  pwdForm : document.getElementById('pwd-form'),
  pwdMsg  : document.getElementById('pwd-msg'),
  turnstileToggle: document.getElementById('turnstile-debug-toggle'),
  turnstileStatus: document.getElementById('turnstile-debug-admin-status')
};
document.getElementById('home-btn'  ).onclick = () => location.href = 'index.html#about';
document.getElementById('logout-btn').onclick = async () => {
  await supabase.auth.signOut(); location.href = '/';
};

const TURNSTILE_DEBUG_STORAGE_KEY = 'portfolio.turnstileDebugVisible';

function isTurnstileDebugVisible() {
  return localStorage.getItem(TURNSTILE_DEBUG_STORAGE_KEY) === 'true';
}

function renderTurnstileDebugState() {
  const isVisible = isTurnstileDebugVisible();

  el.turnstileToggle.textContent = isVisible ? 'HIDE WIDGET' : 'SHOW WIDGET';
  el.turnstileStatus.textContent = isVisible
    ? 'Widget visible on ABOUT'
    : 'Widget hidden on ABOUT';
}

el.turnstileToggle.onclick = () => {
  const nextState = !isTurnstileDebugVisible();

  localStorage.setItem(TURNSTILE_DEBUG_STORAGE_KEY, String(nextState));
  renderTurnstileDebugState();
  el.turnstileStatus.textContent = nextState
    ? 'Widget enabled. Open HOME to inspect it.'
    : 'Widget hidden on ABOUT.';
};

renderTurnstileDebugState();

/* ——— REVIEWS ——— */
loadReviews();
async function loadReviews () {
  el.reviews.innerHTML = 'loading…';
  const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending:false });

  if (error){ el.reviews.textContent = error.message; return; }

  el.reviews.innerHTML = '';
  data.forEach(r => {
    el.reviews.insertAdjacentHTML('beforeend', reviewCard(r));
  });
}

function reviewCard(r){
  const approveBtn = r.approved ? '' :
      `<button class="approve" data-id="${r.id}">APPROVE</button>`;
  return `
    <div class="message-item" data-id="${r.id}">
      <p>${escapeHtml(r.comment)}</p>
      <small>${escapeHtml(r.name)}</small>
      ${approveBtn}
      <button class="del" data-id="${r.id}">DELETE</button>
    </div>`;
}

/* delegate clicks to approve/del */
el.reviews.onclick = async e => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('approve')){
    await supabase.from('reviews').update({approved:true}).eq('id',id);
  } else if (e.target.classList.contains('del')){
    await supabase.from('reviews').delete().eq('id',id);
  }
  loadReviews();
};

/* ——— MESSAGES ——— */
loadMessages();
async function loadMessages(){
  el.messages.innerHTML = 'loading…';
  const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending:false });

  if (error){ el.messages.textContent = error.message; return; }

  el.messages.innerHTML = '';
  data.forEach(m => {
    el.messages.insertAdjacentHTML('beforeend', messageCard(m));
  });
}

function messageCard(m){
  return `
    <div class="card-admin" data-id="${m.id}">
      <small>${escapeHtml(m.name)} • ${escapeHtml(m.email)}</small>
      <p>${escapeHtml(m.body)}</p>
      <button class="del" data-id="${m.id}">DELETE</button>
    </div>`;
}

el.messages.onclick = async e => {
  const id = e.target.dataset.id;
  if (!id || !e.target.classList.contains('del')) return;
  await supabase.from('messages').delete().eq('id', id);
  loadMessages();
};

/* ——— PASSWORD CHANGE ——— */
el.pwdForm.onsubmit = async e => {
  e.preventDefault();
  const pwd = e.target.newPwd.value.trim();
  if (pwd.length < 8){ el.pwdMsg.textContent = 'мин ≥ 8 симв.'; return; }
  
  const { error } = await supabase.auth.updateUser({ password: pwd });
  el.pwdMsg.textContent = error ? error.message : '✓ updated';
  e.target.reset();
};

/* ——— helpers ——— */
function escapeHtml(str=''){
  return str.replace(/[&<>"']/g,ch=>({ '&':'&amp;','<':'&lt;','>':'&gt;',
                                        '"':'&quot;', "'":'&#39;' })[ch]);
}
