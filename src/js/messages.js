import { supabase } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if(!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const fd = new FormData(form);
    const payload = {
      name : fd.get('name').trim(),
      email: fd.get('email').trim(),
      body : fd.get('msg').trim()
    };
    if(!payload.name || !payload.email || !payload.body){
      alert('Заполни все поля'); return;
    }

    const { error } = await supabase.from('messages').insert([payload]);
    if(error){ alert('Ошибка: '+error.message); return; }

    alert('Message sent, thanks!');
    form.reset();
  });
});
