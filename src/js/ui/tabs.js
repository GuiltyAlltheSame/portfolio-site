export function initTabsUI() {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  document.querySelectorAll('.tab .typewriter').forEach((el) => {
    const full = el.textContent.trim();
    const tab = el.closest('.tab');
    let timer;

    tab.addEventListener('mouseenter', () => {
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