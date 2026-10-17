export function initMobileTerminal({ onClose }) {
  const panel = document.getElementById('skills-right');
  const launch = document.getElementById('terminal-open');
  const close = document.getElementById('terminal-close');
  const input = document.getElementById('cmd-input');
  const mobile = window.matchMedia('(max-width: 768px), (max-height: 520px) and (pointer: coarse)');
  let returnFocus = null;
  const held = new Map();

  function open({ trigger } = {}) {
    if (!mobile.matches) return;
    returnFocus = trigger || document.activeElement;
    panel.classList.add('mobile-open');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Skills terminal');
    launch.setAttribute('aria-expanded', 'true');
    document.querySelector('.tabs').inert = true;
    document.getElementById('skills-left').inert = true;
    close.focus({ preventScroll: true });
  }

  function sendKey(type, key) {
    document.dispatchEvent(new KeyboardEvent(type, {
      key, code: key === ' ' ? 'Space' : key, bubbles: true, cancelable: true
    }));
  }
  function releaseKeys() {
    held.forEach(key => sendKey('keyup', key));
    held.clear();
    panel.querySelectorAll('.is-pressed').forEach(button => button.classList.remove('is-pressed'));
  }
  function dismiss({ restoreFocus = true } = {}) {
    const wasOpen = panel.classList.contains('mobile-open');
    releaseKeys();
    if (wasOpen) onClose?.();
    panel.classList.remove('mobile-open');
    panel.removeAttribute('role');
    panel.removeAttribute('aria-modal');
    panel.removeAttribute('aria-label');
    launch.setAttribute('aria-expanded', 'false');
    document.querySelector('.tabs').inert = false;
    document.getElementById('skills-left').inert = false;
    if (wasOpen && restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  launch.addEventListener('click', () => open({ trigger: launch }));
  close.addEventListener('click', () => dismiss());
  // Capture each pointer so held controls also work when a thumb slides away.
  panel.addEventListener('pointerdown', event => {
    const button = event.target.closest('[data-game-key]');
    if (!button) return;
    event.preventDefault();
    input.blur();
    button.setPointerCapture(event.pointerId);
    held.set(event.pointerId, button.dataset.gameKey);
    button.classList.add('is-pressed');
    sendKey('keydown', button.dataset.gameKey);
  });
  function release(event) {
    const key = held.get(event.pointerId);
    if (!key) return;
    sendKey('keyup', key);
    held.delete(event.pointerId);
    event.target.closest('[data-game-key]')?.classList.remove('is-pressed');
  }
  panel.addEventListener('pointerup', release);
  panel.addEventListener('pointercancel', release);
  panel.addEventListener('lostpointercapture', release);
  window.addEventListener('blur', releaseKeys);

  document.addEventListener('keydown', event => {
    if (!panel.classList.contains('mobile-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss();
    }
    if (event.key !== 'Tab') return;
    const focusable = [...panel.querySelectorAll('button, input, textarea, [tabindex="0"]')]
      .filter(element => !element.disabled && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  });
  mobile.addEventListener('change', () => dismiss({ restoreFocus: false }));

  function fitViewport() {
    const viewport = window.visualViewport;
    panel.style.setProperty('--terminal-height', `${viewport?.height || innerHeight}px`);
    panel.style.setProperty('--terminal-top', `${viewport?.offsetTop || 0}px`);
  }
  window.visualViewport?.addEventListener('resize', fitViewport);
  window.visualViewport?.addEventListener('scroll', fitViewport);
  fitViewport();
  return { open, dismiss };
}
