export function initTabsUI({ onBeforeChange } = {}) {
  const tabs = [...document.querySelectorAll('.tab')];
  const panels = [...document.querySelectorAll('.tab-panel')];
  const ids = new Set(panels.map(panel => panel.id));
  document.querySelector('.tabs')?.setAttribute('role', 'tablist');
  tabs.forEach(tab => {
    tab.id = `tab-${tab.dataset.tab}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', tab.dataset.tab);
  });
  panels.forEach(panel => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${panel.id}`);
  });

  function activate(id, { push = false } = {}) {
    if (!ids.has(id)) id = 'about';
    const previous = document.querySelector('.tab-panel.active')?.id;
    if (previous !== id) onBeforeChange?.({ from: previous, to: id });
    tabs.forEach(tab => {
      const selected = tab.dataset.tab === id;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => panel.classList.toggle('active', panel.id === id));
    if (push && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    if (previous !== id) {
      document.querySelector('.tab-content')?.scrollTo(0, 0);
      document.dispatchEvent(new CustomEvent('portfolio:tabchange', { detail: { from: previous, to: id } }));
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.tab, { push: true }));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault();
      activate(tabs[next].dataset.tab, { push: true });
      tabs[next].focus();
    });
  });
  const syncLocation = () => activate(location.hash.slice(1));
  window.addEventListener('popstate', syncLocation);
  window.addEventListener('hashchange', syncLocation);
  syncLocation();

  document.querySelectorAll('.tab .typewriter').forEach((el) => {
    const full = el.textContent.trim();
    const tab = el.closest('.tab');
    let timer;

    tab.addEventListener('mouseenter', () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      clearInterval(timer);
      el.textContent = '';
      el.dataset.typing = 'true';

      let i = 0;
      timer = setInterval(() => {
        el.textContent += full.charAt(i++);
        if (i > full.length) {
          clearInterval(timer);
        }
      }, 50);
    });

    tab.addEventListener('mouseleave', () => {
      clearInterval(timer);
      el.dataset.typing = 'false';
      el.textContent = full;
    });
  });
}
