import { openGameScreen, showGameStage, closeGameScreen } from './games/game-shell.js';
import { registerGame, runGameCommand } from './games/registry.js';
import { startPongGame, stopPongGame } from './games/pong.js';
import { codeSamples } from './data/code-samples.js';
import { demoProjects } from './data/projects.js';

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. Переключение табов ─────────────────── */
  const tabs   = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  /* ─── 2. Hover-анимации названий табов ───────── */
  document.querySelectorAll('.tab .typewriter').forEach(el=>{
    const full = el.textContent.trim();
    const tab  = el.closest('.tab');
    let timer;

    tab.addEventListener('mouseenter', ()=>{
      clearInterval(timer);
      el.textContent = ''; el.dataset.typing = 'true';
      let i = 0;
      timer = setInterval(()=>{
        el.textContent += full.charAt(i++);
        if(i > full.length){ clearInterval(timer); }
      },50);
    });
    tab.addEventListener('mouseleave', ()=>{
      clearInterval(timer);
      el.dataset.typing = 'false';
      el.textContent = full;
    });
  });

  /* ─── 3. Часы в левой колонке ───────────────── */
  function tick(){
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const date = `${d.getDate()}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;

    let h = d.getHours(), m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;

    document.getElementById('clock-date').textContent = date;
    document.getElementById('clock-time').textContent = time;
  }
  tick(); setInterval(tick, 1000);

  
  const out = document.getElementById('code-output');

  const gameExit   = document.getElementById('game-exit');

  const pongStartBtn   = document.getElementById('pong-start');
  const pongDifficulty = document.getElementById('pong-difficulty');

  let activeGame = null;

  registerGame('PONG', {
    openMenu() {
    openGameScreen('PONG');
  },

  start() {
    const selected = pongDifficulty.value;
    showGameStage();
    startPongGame(PONG_PRESETS[selected]);
  },

  stop() {
    stopPongGame();
  }
});

  function typeText(el, txt, speed = 1){
    clearInterval(el._timer);
    el.textContent = ''; el.dataset.typing = 'true';
    let i = 0;
    el._timer = setInterval(()=>{
      el.textContent += txt.charAt(i++);
      if(i > txt.length){
        clearInterval(el._timer);
        el.dataset.typing = 'false';
      }
    }, speed);
  }

  document.querySelectorAll('.skill-list li').forEach(li=>{
    li.addEventListener('click', ()=>{
      const name = li.firstElementChild.textContent.trim()
                       .replace(/\(.*?\)/,'');   // убираем «(Flex+Grid)»
      const demo = codeSamples[name] || `// No DEMO for ${name}`;
      typeText(out, demo);
    });
  });

  /* ---- командная строка и команды------------------------------- */
const cmdInput = document.getElementById('cmd-input');

const helpText = `
Commands:
  CLEAR          — clear screen
  PONG           — start PONG game
  HELP  or  ?    — list of commands
`;

const PONG_PRESETS = {
  easy:   { playerSpeed: 5, aiLerp: 0.035, ballSpeedX: 5,  ballSpeedY: 3 },
  normal: { playerSpeed: 5, aiLerp: 0.05,  ballSpeedX: 7,  ballSpeedY: 4 },
  hard:   { playerSpeed: 6, aiLerp: 0.075, ballSpeedX: 9,  ballSpeedY: 6 },
  insane: { playerSpeed: 7, aiLerp: 0.11,  ballSpeedX: 12, ballSpeedY: 8 }
};

const commands = {
  CLEAR(){
    out.textContent = '';
  },
  HELP(){
    out.textContent += '\n' + helpText.trim() + '\n';
    out.scrollTop = out.scrollHeight;
  }
};

/* alias: знак вопроса вызывает ту же функцию, что и HELP */
commands['?'] = commands.HELP;

pongStartBtn.addEventListener('click', () => {
  if (activeGame && typeof activeGame.start === 'function') {
    activeGame.start();
  }
});

gameExit.addEventListener('click', () => {
  closeGameScreen(() => {
    if (activeGame && typeof activeGame.stop === 'function') {
      activeGame.stop();
    }
    activeGame = null;
  });
});

/* ——— Enter в инпуте ———————————————— */
cmdInput.addEventListener('keydown', e=>{
  if(e.key !== 'Enter') return;

  const raw = cmdInput.value.trim();
  const key = raw.toUpperCase();
  cmdInput.value = '';

if (commands[key]) {
  commands[key]();
} else {
  const game = runGameCommand(key);

  if (game) {
    activeGame = game;
  } else {
    out.textContent += `\n$ ${raw}  — unknown command`;
    out.scrollTop = out.scrollHeight;
  }
}

});


const track = document.getElementById('slider-track');

/* 1. рендер карточек */
demoProjects.forEach(p=>{
  const li=document.createElement('li');
  li.className='card';
  li.innerHTML=`
    <div class="thumb">
      <img class="poster" src="${p.img}"   alt="">
      ${p.hover ? `<img class="noise" src="${p.hover}" alt="">` : ''}
    </div>
    <div class="body">
      <h4>${p.title}</h4>
      <P>${p.line}</P>
      <div class="btns">
        <a href="${p.git}" target="_blank">GIT</a>
        <a href="${p.link}" target="_blank">LINK</a>
      </div>
    </div>`;
  track.appendChild(li);
});

/* === горизонтальный скролл колесом === */
const slider      = document.querySelector('.slider');

slider.addEventListener('wheel', (e) => {
  if (e.deltaY === 0) return;   // вертикального скролла нет – выходим
  e.preventDefault();           // чтобы страница не прокручивалась
  slider.scrollLeft += e.deltaY;
});

/* стартовое состояние */
let slide;
//slide(0);



});



