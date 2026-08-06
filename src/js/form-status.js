const statusElement = () => document.getElementById('form-submit-status');

export function setFormStatus(source, message, state = 'idle') {
  const element = statusElement();
  if (!element) return;

  const sourceElement = element.querySelector('.form-submit-status__source');
  const messageElement = element.querySelector('.form-submit-status__message');

  if (sourceElement) {
    sourceElement.textContent = String(source || 'SYSTEM').toUpperCase();
  }

  if (messageElement) {
    messageElement.textContent = String(message || 'READY').toUpperCase();
  }

  element.dataset.state = state;
}
