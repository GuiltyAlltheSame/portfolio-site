import { supabase } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
  const btn   = document.getElementById('admin-trigger');
  const wrap  = document.getElementById('login-overlay');
  const form  = document.getElementById('login-form');
  const errEl = document.getElementById('login-error');
  const closeBtn = document.getElementById('login-close');

  if (!btn || !wrap || !form || !errEl || !closeBtn) {
    console.error('Admin login controls are missing.');
    return;
  }

  btn.addEventListener('click', () => {
    wrap.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(wrap.classList.contains('open')));
  });

  closeBtn.addEventListener('click', () => {
    wrap.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });
  
  form.addEventListener('submit', async e => {
    e.preventDefault(); errEl.textContent = '';
    const email = String(form.elements.email?.value || '').trim();
    const password = String(form.elements.password?.value || '');

    if (!email || !password) {
      errEl.textContent = 'Enter email and password';
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Admin login error:', error);
        errEl.textContent = error.message || 'Login failed';
        return;
      }

      location.href = 'admin.html';
    } catch (error) {
      console.error('Admin login request failed:', error);
      errEl.textContent = 'Login service unavailable';
    }
  });
});
