export function setFormStatus(source, message, state = 'idle') {
  const normalizedSource = String(source || 'SYSTEM').toUpperCase();
  const normalizedMessage = String(message || 'READY').toUpperCase();
  const forms = normalizedSource === 'SECURITY'
    ? ['contact-form', 'review-form']
    : [normalizedSource === 'REVIEW' ? 'review-form' : 'contact-form'];

  forms.forEach(formId => {
    const button = document.querySelector(`#${formId} [type="submit"]`);
    if (!button) return;

    button.textContent = `[ ${normalizedSource} / ${normalizedMessage} ]`;
    button.dataset.state = state;
    button.setAttribute('aria-live', 'polite');
  });
}
