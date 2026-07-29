export function initProjects({ projects }) {
  const track = document.getElementById('slider-track');
  const slider = document.querySelector('.slider');

  if (!track || !slider || !Array.isArray(projects)) return;

  track.innerHTML = '';

  projects.forEach((project) => {
    const li = document.createElement('li');
    li.className = 'card';
    const projectActions = [
      project.git && `<a href="${project.git}" target="_blank" rel="noopener noreferrer">GIT</a>`,
      project.link && `<a href="${project.link}" target="_blank" rel="noopener noreferrer">LINK</a>`
    ].filter(Boolean).join('');

    li.innerHTML = `
      <div class="thumb">
        <img class="poster" src="${project.img}" alt="${project.title} project preview">
        ${project.hover ? `<img class="noise" src="${project.hover}" alt="" aria-hidden="true">` : ''}
      </div>
      <div class="body">
        <h4>${project.title}</h4>
        <p>${project.line}</p>
        ${projectActions ? `<div class="btns">${projectActions}</div>` : ''}
      </div>
    `;

    track.appendChild(li);
  });

  slider.addEventListener('wheel', (e) => {
    const canScrollHorizontally = slider.scrollWidth > slider.clientWidth;
    if (!canScrollHorizontally || e.deltaY === 0) return;
    e.preventDefault();
    slider.scrollLeft += e.deltaY;
  }, { passive: false });
}
