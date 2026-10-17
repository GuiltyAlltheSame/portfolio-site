const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { handler: contact } = require('../netlify/functions/submit-contact');
const { handler: review } = require('../netlify/functions/submit-review');
const { handler: like } = require('../netlify/functions/submit-like');

const originalFetch = global.fetch;
const originalEnv = { ...process.env };
beforeEach(() => {
  process.env.SUPABASE_URL = 'https://database.example';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-server-only-secret';
  process.env.TURNSTILE_SECRET_KEY = 'test-turnstile-secret';
  process.env.TURNSTILE_ALLOWED_HOSTNAMES = 'portfolio.example';
});
afterEach(() => { global.fetch = originalFetch; process.env = { ...originalEnv }; });
const event = (body, extra = {}) => ({httpMethod:'POST',headers:{'x-nf-client-connection-ip':'192.0.2.1'},body:JSON.stringify(body),...extra});

test('forms reject malformed JSON and non-object bodies without calling services', async () => {
  global.fetch = () => { throw Error('Unexpected network call'); };
  for (const handler of [contact,review]) {
    for (const body of [null,[],42,'hello',true]) assert.equal((await handler(event(body))).statusCode,400);
    assert.equal((await handler(event({}, {body:'{'}))).statusCode,400);
    assert.equal((await handler(event({}, {httpMethod:'GET'}))).statusCode,405);
  }
});

test('forms validate limits and ratings before security verification', async () => {
  global.fetch = () => { throw Error('Unexpected network call'); };
  assert.equal((await contact(event({name:'a'.repeat(81),email:'a@b.com',body:'Hello'}))).statusCode,400);
  for (const rating of [0,6,1.5,'bad']) {
    assert.equal((await review(event({name:'User',comment:'Hello',rating}))).statusCode,400);
  }
});

test('a valid review is verified, then saved unapproved using server credentials', async () => {
  const calls=[];
  global.fetch = async (url, options) => {
    calls.push({url,options});
    return calls.length===1
      ? new Response(JSON.stringify({success:true,action:'review',hostname:'portfolio.example'}))
      : new Response(null,{status:201});
  };
  const result=await review(event({name:' User ',comment:' Hello ',rating:5,token:'test-token'}));
  assert.equal(result.statusCode,200);
  assert.equal(calls.length,2);
  assert.deepEqual(JSON.parse(calls[1].options.body),{name:'User',comment:'Hello',rating:5,approved:false});
  assert.equal(calls[1].options.headers.apikey,'test-server-only-secret');
  assert.ok(!result.body.includes('secret'));
});

test('likes reject unsupported methods, missing settings and unverified IPs', async () => {
  assert.equal((await like(event({}, {httpMethod:'GET'}))).statusCode,405);
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.equal((await like(event({}))).statusCode,503);
  process.env.SUPABASE_SERVICE_ROLE_KEY='test';
  assert.equal((await like(event({}, {headers:{'x-forwarded-for':'192.0.2.1'}}))).statusCode,400);
});

test('likes send a stable hash of the trusted IP and return the database cooldown', async () => {
  const hashes=[];
  const next=new Date(Date.now()+3600000).toISOString();
  global.fetch = async (url,options) => {
    assert.equal(url,'https://database.example/rest/v1/rpc/submit_portfolio_like');
    const hash=JSON.parse(options.body).p_visitor_hash;
    assert.match(hash,/^[0-9a-f]{64}$/);
    hashes.push(hash);
    return new Response(JSON.stringify({accepted:true,total:43,next_allowed_at:next}));
  };
  const first=await like(event({}));
  await like(event({}, {headers:{'x-nf-client-connection-ip':'192.0.2.1','x-forwarded-for':'203.0.113.1'}}));
  await like(event({}, {headers:{'x-nf-client-connection-ip':'192.0.2.2'}}));
  assert.equal(hashes[0],hashes[1]);assert.notEqual(hashes[0],hashes[2]);
  assert.deepEqual(JSON.parse(first.body),{ok:true,total:43,nextAllowedAt:next});
  assert.ok(!first.body.includes('192.0.2') && !first.body.includes('secret'));
});

test('duplicate likes preserve the database deadline and return Retry-After', async () => {
  const next=new Date(Date.now()+1800000).toISOString();
  global.fetch=async()=>new Response(JSON.stringify({accepted:false,total:43,next_allowed_at:next}));
  const result=await like(event({}));
  assert.equal(result.statusCode,429);
  assert.equal(JSON.parse(result.body).nextAllowedAt,next);
  assert.ok(Number(result.headers['Retry-After'])>1790);
});

test('likes fail safely when storage is unavailable or returns invalid data', async () => {
  for (const mock of [
    async()=>new Response('{}',{status:500}),
    async()=>new Response(JSON.stringify({accepted:true,total:'bad',next_allowed_at:'invalid'})),
    async()=>{throw Error('Network offline');}
  ]) {
    global.fetch=mock;
    const result=await like(event({}));
    assert.equal(result.statusCode,502);assert.equal(JSON.parse(result.body).ok,false);
  }
});
