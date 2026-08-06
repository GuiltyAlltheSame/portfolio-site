import { supabase } from './db.js';
import { setFormStatus } from './form-status.js';
import {
  isTurnstileConfigured,
  requestTurnstileToken,
  resetTurnstile
} from './ui/turnstile.js';

async function verifyTurnstile(action) {
  if (!isTurnstileConfigured()) return;

  setFormStatus('MESSAGE', 'VERIFYING', 'pending');
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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if(!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const fd = new FormData(form);
    const submitButton = form.querySelector('[type="submit"]');

    if (String(fd.get('company') || '').trim()) {
      form.reset();
      setFormStatus('MESSAGE', 'SENT', 'success');
      return;
    }

    const payload = {
      name : fd.get('name').trim(),
      email: fd.get('email').trim(),
      body : fd.get('msg').trim()
    };

    if(!payload.name || !payload.email || !payload.body){
      setFormStatus('MESSAGE', 'CHECK FIELDS', 'error');
      return;
    }

    submitButton?.setAttribute('disabled', 'true');
    setFormStatus('MESSAGE', 'SENDING', 'pending');

    try {
      await verifyTurnstile('contact');
      setFormStatus('MESSAGE', 'SENDING', 'pending');

      const { error } = await supabase.from('messages').insert([payload]);
      if (error) throw error;

      form.reset();
      setFormStatus('MESSAGE', 'SENT', 'success');
    } catch (error) {
      console.error('Message submit error:', error);
      setFormStatus('MESSAGE', 'ERROR', 'error');
    } finally {
      if (isTurnstileConfigured()) {
        resetTurnstile('contact');
      }
      submitButton?.removeAttribute('disabled');
    }
  });
});
