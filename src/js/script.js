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

  /* ─── 4. Вывод примеров кода ─────────────────── */
  const codeSamples = {
    HTML5: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARTEM // WEB DEV</title>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="crt">
    <header>
      <h1 class="huge">ARTEM</h1>
      <h1 class="huge" style="margin-top:3px;">KULACHEK</h1>
      <p>FULLSTACK DEV / DESIGN</p>
    </header> 
  </div>`,

    CSS: `.skill-list{
  list-style:none;
  margin:0; padding:0;
  max-height:380px;        
  overflow-y:auto;
  padding: 10px;
}
.skill-list li{
  display:flex; 
  justify-content:space-between;
  padding: 6px 20px 6px 20px;
  font-size: 1.7rem;
}
.row-info{
  display:grid;
  grid-template-columns:30% 70%;
  row-gap:2px;
  font-size: 1.2rem;
  padding: 10px 20px 10px 20px;
}`,

    'Bootstrap 5': `<form>
  <div class="mb-3">
    <label for="exampleInputEmail1" class="form-label">Email address</label>
    <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
    <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
  </div>
  <div class="mb-3">
    <label for="exampleInputPassword1" class="form-label">Password</label>
    <input type="password" class="form-control" id="exampleInputPassword1">
  </div>
  <div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="exampleCheck1">
    <label class="form-check-label" for="exampleCheck1">Check me out</label>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>`,

  'JavaScript': `function tick(){
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul',
      'Aug','Sep','Oct','Nov','Dec'];
    const date = ///{d.getDate()}-///{months[d.getMonth()] 
      }-//{String(d.getFullYear()).slice(-2)};

    let h = d.getHours(), m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const time = ///{String(h).padStart(2,'0')}://
    // {String(m).padStart(2,'0')}///{ampm}//;

    document.getElementById('clock-date').textContent = date;
    document.getElementById('clock-time').textContent = time;
}
tick(); setInterval(tick, 1000);` ,

  Python: `@staticmethod
  def gen_sequence(
      conditions,
  ):  
      possible_characters = [
           str.ascii_lowercase,
           str.ascii_uppercase,
           str.digits,
           str.punctuation,
       ]
      sequence = ""
      for x in range(len(conditions)):
           if conditions[x]:
              sequence += possible_characters[x]
          else:
              pass
      return sequence

    @staticmethod
    def gen_password(sequence, passlength=8):
        password = "".join((secrets.choice(sequence) for i in range(passlength)))
        return password`,


  'SQL': `CREATE TABLE Person(
  Id int not null, 
  Name varchar not null, 
  DateOfBirth date not null, 
  Gender bit not null, 
  PRIMARY KEY(Id)
);
select Candidate, Office_Sought, Election_Year, FORMAT(sum(Total_$),2) from combined_party_data
  where Office_Sought = 'PRESIDENT / VICE PRESIDENT'
  group by Candidate, Office_Sought, Election_Year
  having Election_Year = 2016 and sum(Total_$) between 3000000 and 18000000
  order by sum(Total_$) desc;`,

  'Git/GitHub flow': `$ git fetch
remote: Counting objects: 3032, done.
remote: Compressing objects: 100% (947/947), done.
remote: Total 2672 (delta 1993), reused 2328 (delta 1689)
Receiving objects: 100% (2672/2672), 16.45 MiB | 1.04 MiB/s, done.
Resolving deltas: 100% (1993/1993), completed with 213 local objects.
From github.com:github/github
 * [new branch]      charlock-linguist       -> origin/charlock-linguist
 * [new branch]      enterprise-non-config   -> origin/enterprise-non-config
 * [new branch]      fi-signup               -> origin/fi-signup
   2647a42..4d6d2c2  git-http-server         -> origin/git-http-server
 * [new branch]      knyle-style-commits     -> origin/knyle-style-commits
   157d2b0..d33e00d  master                  -> origin/master
 * [new branch]      menu-behavior-act-i     -> origin/menu-behavior-act-i
   ea1c5e2..dfd315a  no-inline-js-config     -> origin/no-inline-js-config
 * [new branch]      svg-tests               -> origin/svg-tests
   87bb870..9da23f3  view-modes         gtfuh      -> origin/wild-renaming`,
   'Photoshop/Illustrator': `What are you waiting for?` ,

   'CSS/GSAP': `ScrollTrigger.create({
    trigger: '#id',
    start: 'top top',
    endTrigger: '#otherID',
    end: 'bottom 50%+=100px',
    onToggle: (self) => console.log('toggled, isActive:', self.isActive),
    onUpdate: (self) => {
        console.log(
            'progress:',
            self.progress.toFixed(3),
            'direction:',
            self.direction,
            'velocity',
            self.getVelocity()
        );
    }
});` ,
  'Linux&CLI': `ls - The most frequently used command in Linux to list directories
pwd - Print working directory command in Linux
cd - Linux command to navigate through directories
mkdir - Command used to create directories in Linux
mv - Move or rename files in Linux
cp - Similar usage as mv but for copying files in Linux
rm - Delete files or directories
touch - Create blank/empty files
ln - Create symbolic links (shortcuts) to other files
clear - Clear the terminal display
cat - Display file contents on the terminal
echo - Print any text that follows the command
less - Linux command to display paged outputs in the terminal
man - Access manual pages for all Linux commands
uname - Linux command to get basic information about the OS
whoami - Get the active username
tar - Command to extract and compress files in linux
grep - Search for a string within an output
head - Return the specified number of lines from the top
tail - Return the specified number of lines from the bottom
diff - Find the difference between two files
cmp - Allows you to check if two files are identical
comm - Combines the functionality of diff and cmp
sort - Linux command to sort the content of a file while outputting
export - Export environment variables in Linux
zip - Zip files in Linux
unzip - Unzip files in Linux
ssh - Secure Shell command in Linux
service - Linux command to start and stop services
ps - Display active processes
kill and killall - Kill active processes by process ID or name
df - Display disk filesystem information
mount - Mount file systems in Linux
chmod - Command to change file permissions
chown - Command for granting ownership of files or folders
ifconfig - Display network interfaces and IP addresses
traceroute - Trace all the network hops to reach the destination
wget - Direct download files from the internet
ufw - Firewall command
iptables - Base firewall for all other firewall utilities to interface with
apt, pacman, yum, rpm - Package managers depending on the distribution
sudo - Command to escalate privileges in Linux
cal - View a command-line calendar
alias - Create custom shortcuts for your regularly used commands
dd - Majorly used for creating bootable USB sticks
whereis - Locate the binary, source, and manual pages for a command
whatis - Find what a command is used for
top - View active processes live with their system usage
useradd and usermod - Add a new user or change existing user data
passwd - Create or update passwords for existing users`,
  'Node.js': `const http = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\///);
});

server.listen(port, hostname, () => {
  console.log(//Server running at http:///{hostname}:/{port}//);
}); `
  }; 



  const out = document.getElementById('code-output');

  const gameScreen = document.getElementById('game-screen');
  const gameStage  = document.getElementById('game-stage');
  const gameMenu   = document.getElementById('game-menu');
  const gameTitle  = document.getElementById('game-title');
  const gameExit   = document.getElementById('game-exit');

  const pongStartBtn   = document.getElementById('pong-start');
  const pongDifficulty = document.getElementById('pong-difficulty');

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

function openGameScreen(title = 'PONG'){
  gameTitle.textContent = title;

  out.classList.add('hidden');

  gameScreen.classList.remove('hidden');
  gameScreen.setAttribute('aria-hidden', 'false');

  gameMenu.classList.remove('hidden');
  gameMenu.setAttribute('aria-hidden', 'false');

  gameStage.classList.add('hidden');
  gameStage.setAttribute('aria-hidden', 'true');

  cmdInput.placeholder = 'game menu...';
}

function closeGameScreen(){
  cancelAnimationFrame(pongTimer);

  gameScreen.classList.add('hidden');
  gameScreen.setAttribute('aria-hidden', 'true');

  gameStage.classList.add('hidden');
  gameStage.setAttribute('aria-hidden', 'true');

  gameMenu.classList.remove('hidden');
  gameMenu.setAttribute('aria-hidden', 'false');

  out.classList.remove('hidden');

  cmdInput.placeholder = 'type command...';
  cmdInput.focus();
}

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
  },
  PONG(){
    openGameScreen('PONG');
  }
};

/* alias: знак вопроса вызывает ту же функцию, что и HELP */
commands['?'] = commands.HELP;

pongStartBtn.addEventListener('click', () => {
  gameMenu.classList.add('hidden');
  gameMenu.setAttribute('aria-hidden', 'true');

  gameStage.classList.remove('hidden');
  gameStage.setAttribute('aria-hidden', 'false');

  cmdInput.placeholder = 'game running...';

  const selected = pongDifficulty.value;
  startPongGame(PONG_PRESETS[selected]);
});

/* ——— Enter в инпуте ———————————————— */
cmdInput.addEventListener('keydown', e=>{
  if(e.key !== 'Enter') return;

  const raw = cmdInput.value.trim();
  const key = raw.toUpperCase();
  cmdInput.value = '';

  if (commands[key]){
    commands[key]();                       // выполняем
  } else {
    out.textContent += `\n$ ${raw}  — unknown command`;
    out.scrollTop = out.scrollHeight;
  }
});

const demoProjects = [
  {
    title: 'Flexboxer.com',
    line : '"CRT" style portfolio landing',
    img  : 'assets/img/card_retro_portfolio.png',   // GIF или PNG / JPG
    git  : 'https://github.com/GuiltyAlltheSame/portfolio-site',
    link : 'https://flexboxer.com/'
  },
  {
    title: 'Spiza.com',
    line : 'Knited toys shop',
    img  : 'assets/img/question.png',  // обычная картинка
    hover: 'assets/img/white-noise.gif',
    git  : 'https://github.com/you/react-blog',
    link : 'https://blog.you.com'
  },
  {
    title: 'Cinemorph',
    line : 'Cinema prod portfolio landing',
    img  : 'assets/img/question.png',
    hover: 'assets/img/white-noise.gif',
    git  : 'https://github.com/GuiltyAlltheSame/cinemorph-site',
    link : '#'                           // нет демо — оставляем «#»
  },
   {
    title: '???',
    line : '???',
    img  : 'assets/img/question.png',
    hover: 'assets/img/white-noise.gif',
    git  : 'https://github.com/you/node-api',
    link : '#'                           // нет демо — оставляем «#»
  }
];

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

/* PONG GAME --------------------------------------------------------------------------------------------------------- */
let playerScore = 0;
let aiScore = 0;

let upPressed = false, downPressed = false;
let pongTimer = null;

function startPongGame(settings = PONG_PRESETS.normal){
  const canvas = document.getElementById('pong-canvas');
  const ctx = canvas.getContext('2d');

  const paddleWidth = 10, paddleHeight = 80;
  const ballSize = 10;

  let playerY = canvas.height / 2 - paddleHeight / 2;
  let aiY = playerY;

  let ballX = canvas.width / 2, ballY = canvas.height / 2;
  let ballVX = settings.ballSpeedX;
  let ballVY = settings.ballSpeedY;
  const playerSpeed = settings.playerSpeed;
  const aiLerp = settings.aiLerp;

  function resetBall(){
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballVX = (ballVX > 0 ? -1 : 1) * settings.ballSpeedX;
    ballVY = (Math.random() * settings.ballSpeedY) - settings.ballSpeedY / 2;
  }

  function draw(){
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8AFF3C';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${playerScore}  ${aiScore}`, canvas.width / 2, 30);

    ctx.fillRect(10, playerY, paddleWidth, paddleHeight); // игрок
    ctx.fillRect(canvas.width - 20, aiY, paddleWidth, paddleHeight); // AI
    ctx.fillRect(ballX, ballY, ballSize, ballSize); // мяч
    // пунктирная линия в центре
    ctx.beginPath();
    ctx.setLineDash([5, 5]); // 5px линия, 5px пропуск
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#8AFF3C';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]); // сброс пунктирной настройки
   }

  function update(){
    ballX += ballVX;
    ballY += ballVY;

    if(ballY <= 0 || ballY + ballSize >= canvas.height)
      ballVY *= -1;

    // столкновение с игроком
    if (ballX <= 20 && ballY + ballSize > playerY && ballY < playerY + paddleHeight) {
      ballVX *= -1;
      const hitPos = (ballY + ballSize/2) - (playerY + paddleHeight/2);
      ballVY = hitPos * 0.2 + (Math.random() - 0.5);
    }

    // столкновение с AI
    if (ballX + ballSize >= canvas.width - 20 &&
        ballY + ballSize > aiY && ballY < aiY + paddleHeight) {
      ballVX *= -1;
      const hitPos = (ballY + ballSize/2) - (aiY + paddleHeight/2);
      ballVY = hitPos * 0.2 + (Math.random() - 0.5);
    }

    // движение AI
    aiY += (ballY - aiY - paddleHeight/2) * aiLerp;

    if(upPressed) playerY -= playerSpeed;
    if(downPressed) playerY += playerSpeed;

    playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));

    // мяч улетел
    if(ballX < 0) { aiScore++; resetBall(); }
    if(ballX > canvas.width) { playerScore++; resetBall(); }
  }

  function loop(){
    update();
    draw();
    pongTimer = requestAnimationFrame(loop);
  }

  // сброс очков при старте
  playerScore = 0;
  aiScore = 0;
  cancelAnimationFrame(pongTimer); // защита от повторного запуска
  loop();
}

// Выход из игры внутри терминального экрана
gameExit.onclick = () => {
  closeGameScreen();
};

// Клавиши
document.addEventListener('keydown', e => {
  if(e.key === 'ArrowUp') upPressed = true;
  if(e.key === 'ArrowDown') downPressed = true;
});
document.addEventListener('keyup', e => {
  if(e.key === 'ArrowUp') upPressed = false;
  if(e.key === 'ArrowDown') downPressed = false;
});



});



