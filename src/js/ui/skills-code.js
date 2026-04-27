export function initSkillsCode({ out, codeSamples }) {
  if (!out || !codeSamples) return;

  function typeText(el, txt, speed = 1) {
    clearInterval(el._timer);
    el.textContent = '';
    el.dataset.typing = 'true';

    let i = 0;
    el._timer = setInterval(() => {
      el.textContent += txt.charAt(i++);
      if (i > txt.length) {
        clearInterval(el._timer);
        el.dataset.typing = 'false';
      }
    }, speed);
  }

  document.querySelectorAll('.skill-list li').forEach((li) => {
    li.addEventListener('click', () => {
      const name = li.firstElementChild.textContent.trim().replace(/\(.*?\)/, '');
      const demo = codeSamples[name] || `// No DEMO for ${name}`;
      typeText(out, demo);
    });
  });
}