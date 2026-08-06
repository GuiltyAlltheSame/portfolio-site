import { setFormStatus } from './form-status.js';
import {
  isTurnstileConfigured,
  requestTurnstileToken,
  resetTurnstile
} from './ui/turnstile.js';

async function submitMessage(payload, token, company) {
  setFormStatus('MESSAGE', 'VERIFYING', 'pending');
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...payload, token, company })
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.ok !== true) {
    throw new Error(result.error || 'Submission failed.');
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
      const token = await requestTurnstileToken('contact');
      setFormStatus('MESSAGE', 'SENDING', 'pending');
      await submitMessage(payload, token, fd.get('company'));

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
