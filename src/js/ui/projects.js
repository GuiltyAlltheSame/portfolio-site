export function initProjects({ projects }) {
  const track = document.getElementById('slider-track');
  const slider = document.querySelector('.slider');

  if (!track || !slider || !Array.isArray(projects)) return;

  track.innerHTML = '';

  projects.forEach((project) => {
    const li = document.createElement('li');
    li.className = 'card';

    li.innerHTML = `
      <div class="thumb">
        <img class="poster" src="${project.img}" alt="">
        ${project.hover ? `<img class="noise" src="${project.hover}" alt="">` : ''}
      </div>
      <div class="body">
        <h4>${project.title}</h4>
        <p>${project.line}</p>
        <div class="btns">
          <a href="${project.git}" target="_blank" rel="noopener noreferrer">GIT</a>
          <a href="${project.link}" target="_blank" rel="noopener noreferrer">LINK</a>
        </div>
      </div>
    `;

    track.appendChild(li);
  });

  slider.addEventListener('wheel', (e) => {
    if (e.deltaY === 0) return;
    e.preventDefault();
    slider.scrollLeft += e.deltaY;
  }, { passive: false });
}