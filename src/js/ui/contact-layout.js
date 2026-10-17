// Fit the existing copy to its allocated space without changing its wording.
export function initContactLayout() {
  const paragraph = document.querySelector('#contact .little-about');
  if (!paragraph) return;
  const desktop = window.matchMedia('(min-width: 993px)');
  let frame = null;

  function fit() {
    frame = null;
    if (!desktop.matches) {
      paragraph.style.removeProperty('font-size');
      return;
    }
    if (!paragraph.clientHeight || !paragraph.clientWidth) return;

    let low = 10;
    let high = 28;
    for (let step = 0; step < 9; step++) {
      const size = (low + high) / 2;
      paragraph.style.fontSize = `${size}px`;
      if (paragraph.scrollHeight <= paragraph.clientHeight &&
          paragraph.scrollWidth <= paragraph.clientWidth) low = size;
      else high = size;
    }
    paragraph.style.fontSize = `${Math.floor(low * 10) / 10}px`;
  }

  function schedule() {
    if (frame === null) frame = requestAnimationFrame(fit);
  }
  const observer = new ResizeObserver(schedule);
  observer.observe(paragraph);
  desktop.addEventListener('change', schedule);
  document.fonts.ready.then(schedule);
  schedule();
}
