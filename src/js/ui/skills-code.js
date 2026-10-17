export function initSkillsCode({ out, codeSamples, onSelect }) {
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
    if (li.classList.contains('skill-disabled')) {
      li.setAttribute('aria-label', `${li.firstElementChild.textContent} (unavailable)`);
      return;
    }
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `Show ${li.firstElementChild.textContent} example`);
    function selectSkill() {
      onSelect?.(li);
      const name = li.firstElementChild.textContent.trim().replace(/\(.*?\)/, '');
      const demo = codeSamples[name] || `// No DEMO for ${name}`;
      typeText(out, demo);
    }
    li.addEventListener('click', selectSkill);
    li.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      selectSkill();
    });
  });
}
