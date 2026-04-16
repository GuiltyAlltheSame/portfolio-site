import { supabase } from './db.js';

const COOLDOWN_MS = 0.01 * 60 * 1000;   // 1 hour   ← change here
const TIMER_MS    = 8000;             // duration of reverse bar

(async ()=>{
  await initLikes('#like-btn', TIMER_MS);
})();        

async function initLikes(sel, duration){
  const btn   = document.querySelector(sel);
  const span  = btn.querySelector('.count');
  
  /* check, if time come */
  const blockUntil = +localStorage.getItem('likes_block_until') || 0;
  let disabled = Date.now() < blockUntil;
  let active  = false;                 // timer runs?
  let start   = 0;
  let count = 0;                           // fill after fetch
  
  await loadTotal();                       // ← awaits loading from DB
  
  if(disabled){ disable(); }

  /* hover fill */
  btn.addEventListener('mouseenter', ()=>!active&&!disabled && setFill(100));
  btn.addEventListener('mouseleave', ()=>!active&&!disabled && setFill(0));

  /* click */
  btn.addEventListener('click', ()=>{
    if(disabled) return;

    flashHeart();

    if(!active){                       // first click → timer start
      active = true;
      btn.classList.add('active-fill'); 
      start  = performance.now();
      tick();
    }

count++;
span.textContent = count;

/* ask db without await – no blocking next clicks */
supabase
  .rpc('increment_likes')
  .then(({ data, error })=>{
    if(error){
      console.error('increment error', error);
      /* count rollback if error */
      return;
    }
    /* server approve: adjust count */
    count = data;
    span.textContent = count;
  });
  });

  /* rAF-cycle filler get smaller */
  function tick(now=performance.now()){
    const elapsed = now - start;
    const left    = Math.max(0, 1 - elapsed/duration);   // 1..0 speed
    setFill(left*100);

    if(left>0){
      requestAnimationFrame(tick);
    }else{
      disable();
    }
  }

  /* helpers */
  function setFill(pct){ btn.style.setProperty('--fill', pct + '%'); }
  function disable(){
    disabled = true;
    active   = false;
    setFill(0);
    btn.classList.add('disabled');
    btn.disabled = true;
    localStorage.setItem('likes_block_until', Date.now() + COOLDOWN_MS);
    btn.classList.remove('active-fill');
  }

  function flashHeart(){
  const icon = btn.querySelector('.heart-icon');
  icon.classList.replace('fa-regular','fa-solid'); // закрашиваем
  icon.classList.add('heart-press');               // пульсация

  // after 180 ms retirn border and disable animation
  setTimeout(()=>{
    icon.classList.replace('fa-solid','fa-regular');
    icon.classList.remove('heart-press');
  }, 180);
}

async function loadTotal(){
  const { data, error } = await supabase
        .from('likes_counter')
        .select('total')
        .eq('id', 1)
        .single();

  if(!error && data){
    count = data.total;
    span.textContent = count;
  }else{
    console.error('loadTotal error', error);
  }
}
}
