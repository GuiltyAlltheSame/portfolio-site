/***************************************************************************
 *   ADMIN PANEL                                                           *
 *   3 windows: Reviews | Messages | Password                               *
 *   guests defender, fast CRUD thru Supabase                         *
 ***************************************************************************/
import { supabase } from './db.js';

async function initAdmin() {

/* ——— guard: only who logged in ——— */
const { data: { session } } = await supabase.auth.getSession();
if (!session) { location.replace('/'); return; }

/* ——— DOM refs ——— */
const el = {
  reviews : document.getElementById('reviews-list'),
  messages: document.getElementById('messages-list'),
  pwdForm : document.getElementById('pwd-form'),
  pwdMsg  : document.getElementById('pwd-msg')
};
document.getElementById('home-btn'  ).onclick = () => location.href = 'index.html#about';
document.getElementById('logout-btn').onclick = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) { document.getElementById('admin-status').textContent = 'Sign out failed. Please try again.'; return; }
  location.href = '/';
};

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
    await runMutation(e.target, () => supabase.from('reviews').update({approved:true}).eq('id',id), loadReviews);
  } else if (e.target.classList.contains('del')){
    await runMutation(e.target, () => supabase.from('reviews').delete().eq('id',id), loadReviews);
  }
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
  await runMutation(e.target, () => supabase.from('messages').delete().eq('id', id), loadMessages);
};

/* ——— PASSWORD CHANGE ——— */
el.pwdForm.onsubmit = async e => {
  e.preventDefault();
  const pwd = e.target.newPwd.value;
  if (pwd.length < 8){ el.pwdMsg.textContent = 'мин ≥ 8 симв.'; return; }
  
  const button = e.target.querySelector('button');
  button.disabled = true;
  try {
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) throw error;
    el.pwdMsg.textContent = '✓ updated';
    e.target.reset();
  } catch {
    el.pwdMsg.textContent = 'Password not changed. Please try again.';
  } finally { button.disabled = false; }
};

async function runMutation(button, request, reload) {
  if (button.disabled) return;
  const buttons = [...button.parentElement.querySelectorAll('button')];
  const status = document.getElementById('admin-status');
  buttons.forEach(control => { control.disabled = true; });
  status.textContent = 'Saving…';
  try {
    const { error } = await request();
    if (error) throw error;
    status.textContent = '✓ Saved';
    await reload();
  } catch {
    status.textContent = 'Change not saved. Check your connection and try again.';
  } finally { buttons.forEach(control => { control.disabled = false; }); }
}

/* ——— helpers ——— */
function escapeHtml(str=''){
  return str.replace(/[&<>"']/g,ch=>({ '&':'&amp;','<':'&lt;','>':'&gt;',
                                        '"':'&quot;', "'":'&#39;' })[ch]);
}
}

initAdmin().catch(() => {
  document.getElementById('admin-status').textContent = 'Admin service unavailable. Please reload the page.';
});
