// Local browser regression checks. Uses an isolated Chrome profile and mocked
// database/API responses; it never submits anything to production services.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const root = path.resolve('src');
const albumRoot = process.env.ALBUM_SOURCE;
const output = path.resolve('output/review');
fs.mkdirSync(output, { recursive: true });
let likes = 42;
let nextLike = 0;
let failLike = false;
const dbMock = `
  const query = table => {
    let mutation=false;
    const q = {
      select(){return q}, eq(){return q}, order(){return q}, limit(){return q},
      update(){mutation=true;return q}, delete(){mutation=true;return q},
      single(){return Promise.resolve({data:{total:42},error:null})},
      then(resolve,reject){
        const admin=location.search.includes('admin-test');
        const data=admin && !mutation ? (table==='reviews' ? [{id:1,name:'Test reviewer',comment:'Test review',approved:false}] : [{id:2,name:'Test sender',email:'sender@example.com',body:'Test message'}]) : [];
        return Promise.resolve({data,error:mutation && window.__adminFail?{message:'Test failure'}:null}).then(resolve,reject)
      }
    }; return q;
  };
  export const supabase={from:query,auth:{
    getSession:async()=>({data:{session:location.search.includes('admin-test')?{}:null}}),
    signOut:async()=>({error:null}),updateUser:async()=>({error:window.__adminFail?{}:null})
  }};`;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/js/db.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(dbMock); return; }
  if (url.pathname === '/api/like') {
    res.setHeader('Content-Type', 'application/json');
    if (failLike) { res.writeHead(503).end(JSON.stringify({ok:false})); return; }
    if (Date.now() < nextLike) {
      res.writeHead(429); res.end(JSON.stringify({ok:false,total:likes,nextAllowedAt:new Date(nextLike).toISOString()}));
    } else {
      nextLike = Date.now() + 3600000;
      res.end(JSON.stringify({ok:true,total:++likes,nextAllowedAt:new Date(nextLike).toISOString()}));
    }
    return;
  }
  const album = albumRoot && url.pathname.startsWith('/album/');
  const directory = album ? path.resolve(albumRoot) : root;
  const relative = album ? url.pathname.slice('/album'.length) : url.pathname;
  const file = path.resolve(directory, '.' + (relative.endsWith('/') ? relative + 'index.html' : relative));
  if (!file.startsWith(directory + path.sep) || relative.includes('/.')) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'})[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});

let browser;
let ws;
let requestId = 0;
const pending = new Map();
const errors = [];
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-qa-'));
const deadline = setTimeout(() => { console.error('Browser check timed out'); browser?.kill(); process.exit(1); }, 120000);
try {
  await new Promise((resolve,reject) => { server.on('error',reject); server.listen(0,'127.0.0.1',resolve); });
  const base = `http://127.0.0.1:${server.address().port}`;
  console.log('Local QA server ready');
  const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  browser = spawn(chrome, ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9341',`--user-data-dir=${profile}`,'about:blank'], {windowsHide:true,stdio:'ignore'});
  browser.on('error', error => { console.error(error.message); process.exit(1); });
  let targets;
  for (let i=0;i<50;i++) {
    try { targets=await(await fetch('http://127.0.0.1:9341/json',{signal:AbortSignal.timeout(1000)})).json(); break; }
    catch { await sleep(200); }
  }
  assert.ok(targets, 'Chrome remote debugging must start');
  ws = new WebSocket(targets.find(target=>target.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  ws.addEventListener('message',({data})=>{
    const message=JSON.parse(data);
    if(message.id){const entry=pending.get(message.id);pending.delete(message.id);message.error?entry?.reject(Error(message.error.message)):entry?.resolve(message.result);}
    else if(message.method==='Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  });
  const call = (method,params={}) => new Promise((resolve,reject)=>{const id=++requestId;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate = async expression => {
    const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async expression => {
    for(let i=0;i<100;i++){if(await evaluate(expression))return;await sleep(100);}
    throw Error(`Timed out waiting for: ${expression}`);
  };
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const command = value => evaluate(`(()=>{const input=document.getElementById('cmd-input');input.value=${JSON.stringify(value)};input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));})()`);
  const viewport = async (width,height=844,mobile=width<=768) => {
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
    await call('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:2});
  };
  const screenshot = async (name,format='png') => {
    const image=await call('Page.captureScreenshot',{format,quality:format==='webp'?78:undefined,captureBeyondViewport:false});
    fs.writeFileSync(name,Buffer.from(image.data,'base64'));
  };
  await call('Page.enable'); await call('Runtime.enable');
  await call('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.__widgets=[];
    window.turnstile={render:(host,config)=>{window.__widgets.push(config);return window.__widgets.length-1},execute:id=>window.__widgets[id].callback('local-test-token'),reset:()=>{}};
  `});

  if(albumRoot){
    await viewport(1200,750);
    await call('Page.navigate',{url:base+'/album/'});
    await waitFor("document.readyState==='complete' && document.querySelector('.intro__slide')?.complete");
    await evaluate('Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,3000))]).then(()=>true)');
    await screenshot(path.resolve('src/assets/img/farewell-and-hello.webp'),'webp');
    console.log('Captured current photo album preview');
  }

  await viewport(1440,900);
  await call('Page.navigate',{url:base+'/#projects'});
  await waitFor("document.querySelectorAll('#slider-track .card').length===3");
  assert.equal(await evaluate("document.querySelector('.tab-panel.active').id"),'projects');
  assert.equal(await evaluate("document.querySelectorAll('#slider-track .card:nth-child(2) .btns a').length"),1);
  assert.equal(await evaluate("document.querySelector('#slider-track .card:nth-child(2) a').href"),'https://github.com/GuiltyAlltheSame/FarewellandHello');
  await screenshot(path.join(output,'projects-desktop.png'));
  await click('[data-tab=skills]');
  assert.equal(await evaluate('location.hash'),'#skills');
  await call('Page.reload');
  await waitFor("document.querySelector('.tab-panel.active')?.id==='skills' && document.querySelectorAll('.card').length===3");
  await click('[data-tab=contact]');
  await evaluate('history.back()');
  await waitFor("document.querySelector('.tab-panel.active')?.id==='skills'");
  await evaluate('history.forward()');
  await waitFor("document.querySelector('.tab-panel.active')?.id==='contact'");
  console.log('PASS: direct links, reload, Back and Forward');

  await click('[data-tab=skills]'); await command('PBALL');
  await waitFor("!!document.getElementById('pball-start')"); await click('#pball-start');
  // Even while playing, editable controls must receive their spaces.
  assert.equal(await evaluate(`(()=>{const input=document.getElementById('cmd-input');const e=new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true,cancelable:true});input.dispatchEvent(e);return e.defaultPrevented})()`),false);
  await click('[data-tab=contact]');
  assert.equal(await evaluate("document.getElementById('game-screen').classList.contains('hidden')"),true);
  assert.equal(await evaluate(`(()=>{const input=document.querySelector('[name=msg]');const e=new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true,cancelable:true});input.dispatchEvent(e);return e.defaultPrevented})()`),false);
  console.log('PASS: P-BALL exits on tab change and never captures form spaces');

  await click('#like-btn'); await waitFor("document.querySelector('#like-btn .count').textContent==='43'");
  assert.equal(await evaluate('document.getElementById("like-btn").disabled'),true);
  const saved=await evaluate("localStorage.getItem('likes_block_until')");
  assert.ok(Number(saved)-Date.now()>3590000);
  await call('Page.reload'); await waitFor("document.querySelectorAll('.card').length===3");
  assert.equal(await evaluate("localStorage.getItem('likes_block_until')"),saved);
  assert.equal(await evaluate('document.getElementById("like-btn").disabled'),true);
  await evaluate("localStorage.removeItem('likes_block_until');window.dispatchEvent(new StorageEvent('storage',{key:'likes_block_until'}))");
  await click('#like-btn'); await waitFor('document.getElementById("like-btn").disabled && document.getElementById("like-status").textContent.includes("NEXT LIKE")');
  assert.equal(likes,43);
  await evaluate("localStorage.setItem('likes_block_until',String(Date.now()+150));window.dispatchEvent(new StorageEvent('storage',{key:'likes_block_until'}))");
  await waitFor('!document.getElementById("like-btn").disabled');
  const previousCount=await evaluate('document.querySelector("#like-btn .count").textContent');
  failLike=true;await click('#like-btn');
  await waitFor('document.getElementById("like-status").textContent.includes("NOT SAVED")');
  assert.equal(await evaluate('document.querySelector("#like-btn .count").textContent'),previousCount);
  assert.equal(await evaluate('document.getElementById("like-btn").disabled'),false);
  failLike=false;
  console.log('PASS: hourly cooldown survives reload, server rejects repeats, expiry unlocks');

  for(const width of [320,390,768]) {
    await viewport(width); await click('[data-tab=skills]'); await click('#terminal-open');
    assert.equal(await evaluate('document.getElementById("skills-right").getBoundingClientRect().width'),width);
    assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);
    await command('THEME');
    await waitFor("!!document.querySelector('[data-theme-choice=orange]')");
    await click('[data-theme-choice=orange]');
    assert.equal(await evaluate('document.documentElement.dataset.theme'),'orange');
    await command('NOTES');
    await waitFor("!!document.querySelector('textarea') && document.getElementById('game-screen').dataset.terminalApp==='notes'");
    await command('POMO');
    await click('#pomodoro-start');
    assert.equal(await evaluate('document.getElementById("pomodoro-start").textContent'),'PAUSE');
    await command('PBALL'); await waitFor("!!document.getElementById('pball-start')");
    await click('#pball-start');
    const touch=await evaluate(`(()=>{const b=document.querySelector('[data-game-key=ArrowUp]');const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,bottom:r.bottom,height:r.height,viewport:innerHeight}})()`);
    assert.ok(touch.height>=44 && touch.bottom<=touch.viewport,'Touch controls must be visible');
    await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touch.x,y:touch.y}]});
    assert.equal(await evaluate('document.querySelector("[data-game-key=ArrowUp]").classList.contains("is-pressed")'),true);
    await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    if(width===390)await screenshot(path.join(output,'mobile-pball.png'));
    await command('CRABOID');await waitFor("!!document.getElementById('craboid-start')");await click('#craboid-start');
    assert.equal(await evaluate('document.querySelectorAll(".craboid-stage .game-touch-controls button").length'),4);
    await command('HELP');
    assert.equal(await evaluate('document.getElementById("game-screen").classList.contains("hidden")'),true);
    await click('#terminal-close');
    assert.equal(await evaluate('document.querySelector(".tabs").inert'),false);
    await click('.skill-list li');
    assert.equal(await evaluate('document.getElementById("skills-right").classList.contains("mobile-open")'),true);
    if(width===390){await waitFor("document.getElementById('code-output').dataset.typing==='false'");await screenshot(path.join(output,'mobile-terminal.png'));}
    await click('#terminal-close');
    console.log(`PASS: ${width}px mobile terminal, themes, apps and touch games`);
  }
  await viewport(844,390,true);await click('[data-tab=skills]');await click('#terminal-open');
  await command('PBALL');await waitFor("!!document.getElementById('pball-start')");await click('#pball-start');
  assert.equal(await evaluate('document.getElementById("skills-right").classList.contains("mobile-open")'),true);
  assert.ok(await evaluate('[...document.querySelectorAll(".game-touch-controls button")].every(button=>button.getBoundingClientRect().bottom<=innerHeight)'));
  await screenshot(path.join(output,'mobile-landscape.png'));
  await click('#terminal-close');
  console.log('PASS: phone landscape keeps game controls visible');
  await viewport(820);await click('[data-tab=skills]');
  assert.notEqual(await evaluate('getComputedStyle(document.getElementById("skills-right")).display'),'none');
  await viewport(1440,900);await click('[data-tab=projects]');
  await waitFor("[...document.querySelectorAll('.poster')].every(image=>image.complete && image.naturalWidth>0)");
  await screenshot(path.join(output,'projects-desktop.png'));
  await viewport(1440,720);
  assert.ok(await evaluate(`(()=>{const slider=document.querySelector('.slider').getBoundingClientRect();return [...document.querySelectorAll('.btns')].every(buttons=>buttons.getBoundingClientRect().bottom<=slider.bottom+1)})()`),'Project actions must not be clipped on shorter screens');
  await call('Page.navigate',{url:base+'/admin.html?admin-test'});
  await waitFor("!!document.querySelector('.approve') && !!document.querySelector('#messages-list .del')");
  await evaluate('window.__adminFail=true');
  await click('.approve');
  await waitFor("document.getElementById('admin-status').textContent.includes('not saved')");
  assert.equal(await evaluate('document.querySelector(".approve").disabled'),false);
  await click('#messages-list .del');
  await waitFor("document.getElementById('admin-status').textContent.includes('not saved')");
  assert.equal(await evaluate('document.querySelectorAll("#messages-list .card-admin").length'),1);
  await evaluate("document.querySelector('[name=newPwd]').value='keep-this-password';document.getElementById('pwd-form').requestSubmit()");
  await waitFor("document.getElementById('pwd-msg').textContent.includes('not changed')");
  assert.equal(await evaluate('document.querySelector("[name=newPwd]").value'),'keep-this-password');
  console.log('PASS: failed admin actions show errors and preserve messages/password input');
  assert.deepEqual(errors,[],'No uncaught browser errors');
  console.log('All browser checks passed. Screenshots: output/review');
} catch(error) { console.error(error); process.exitCode=1; }
finally {
  clearTimeout(deadline);
  if(ws?.readyState===1)ws.send(JSON.stringify({id:++requestId,method:'Browser.close'}));
  ws?.close();browser?.kill();server.close();
}
