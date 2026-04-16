import { supabase } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
  const btn   = document.getElementById('admin-trigger');
  const wrap  = document.getElementById('login-overlay');
  const form  = document.getElementById('login-form');
  const errEl = document.getElementById('login-error');
  const closeBtn = document.getElementById('login-close');

  btn.addEventListener('click', () => wrap.classList.toggle('open'));
  closeBtn.addEventListener('click', () => wrap.classList.remove('open'));
  
  form.addEventListener('submit', async e => {
    e.preventDefault(); errEl.textContent = '';
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.value.trim(),
      password: form.password.value
    });
    if (error) { errEl.textContent = 'Incorrect login / password'; return; }
    location.href = 'admin.html';
  });
});