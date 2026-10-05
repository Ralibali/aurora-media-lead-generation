import { chromium } from 'playwright';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { pathToFileURL } from 'node:url';

const ENDPOINT = 'https://cyymcdqkpvcvwjoqxbco.supabase.co/functions/v1/website-guardian';
const DANGEROUS_PATH = /(?:^|[/_.-])(logout|signout|sign-out|log-out|delete|remove|unsubscribe|confirm|activate|purchase|pay|reset-password)(?:$|[/_.-])/i;
const sensitiveQuery = url => [...url.searchParams.keys()].some(key => /^(action|token|password|secret|access_token|code)$/i.test(key));

export function safeNavigation(raw, origin) {
  const url = new URL(raw, origin);
  if (url.protocol !== 'https:' || url.origin !== origin || url.username || url.password || url.port) throw new Error('Navigation outside the approved HTTPS origin was blocked.');
  if (DANGEROUS_PATH.test(decodeURIComponent(url.pathname)) || sensitiveQuery(url)) throw new Error('A state-changing or credential-bearing URL was blocked.');
  return url.href;
}

export function publicAddress(address) {
  // Pin one public IPv4 address per browser. No IPv6-mapped/private alternatives.
  if (isIP(address) !== 4) return false;
  const [a,b] = address.split('.').map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && [0,168].includes(b)) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && [18,19,51].includes(b)) || (a === 203 && b === 0));
}

export function requestAllowed(url, method, origin, document = false) {
  if (!['GET','HEAD'].includes(method)) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.origin !== origin || parsed.username || parsed.password || parsed.port) return false;
    if (document) safeNavigation(url, origin);
    return !DANGEROUS_PATH.test(decodeURIComponent(parsed.pathname)) && !sensitiveQuery(parsed);
  } catch { return false; }
}

export function classifyAttempts(attempts) {
  return attempts.at(-1).status === 'failed' ? 'failed' : attempts.length === 2 ? 'flaky' : 'passed';
}

function shortError(error) {
  // Evidence stays in the protected backend; never print page content or tokens to CI logs.
  return String(error?.message ?? error).replace(/\x1b\[[0-9;]*m/g, '').slice(0,900);
}

export async function runAttempt(browser, job, attempt) {
  const began = Date.now();
  const context = await browser.newContext({ viewport: {width: 1280,height: 800}, serviceWorkers: 'block', acceptDownloads: false, locale:'sv-SE' });
  await context.route('**/*', route => {
    const request = route.request();
    return requestAllowed(request.url(), request.method(), job.allowed_origin, request.isNavigationRequest()) ? route.continue() : route.abort('blockedbyclient');
  });
  await context.routeWebSocket('**/*', socket => socket.close());
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(15_000);
  page.on('dialog', dialog => dialog.dismiss());
  context.on('page', popup => { if (popup !== page) void popup.close(); });
  const evidence = [];
  let error;
  let screenshot;
  const deadline = setTimeout(() => void context.close(), 110_000);
  try {
    if (!Array.isArray(job.steps) || job.steps.length < 2 || job.steps.length > 8 || job.steps[0].type !== 'navigate' || !job.steps.some(s=>['assert_visible','assert_text'].includes(s.type))) throw new Error('Invalid flow contract.');
    for (const [index,step] of job.steps.entries()) {
      const started = Date.now();
      try {
        if (step.type === 'navigate') {
          const response = await page.goto(safeNavigation(step.url,job.allowed_origin), {waitUntil:'domcontentloaded'});
          if (!response || response.status() >= 400) throw new Error(`Page returned HTTP ${response?.status() ?? 'no response'}.`);
          safeNavigation(page.url(),job.allowed_origin);
        } else if (step.type === 'click_link') {
          const link = page.locator(step.selector);
          await link.waitFor({state:'visible'});
          if (await link.count() !== 1) throw new Error('The link selector must match exactly one link.');
          if (await link.evaluate(el => el.tagName.toLowerCase()) !== 'a') throw new Error('Only actual links can be clicked.');
          const href = await link.getAttribute('href');
          if (!href) throw new Error('The link has no destination.');
          safeNavigation(new URL(href,page.url()).href,job.allowed_origin);
          await link.click({timeout:10_000});
          await page.waitForLoadState('domcontentloaded');
          safeNavigation(page.url(),job.allowed_origin);
        } else if (step.type === 'assert_visible' || step.type === 'assert_text') {
          const element = page.locator(step.selector);
          await element.waitFor({state:'visible'});
          await element.scrollIntoViewIfNeeded();
          // Playwright's visibility check accepts opacity:0. Wait for reveal animations
          // too, so the evidence shows the content that a visitor could actually see.
          await page.waitForFunction(({selector,text}) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length !== 1 || !(elements[0] instanceof HTMLElement)) return false;
            const element = elements[0];
            for (let node = element; node; node = node.parentElement) {
              const style = getComputedStyle(node);
              if (Number(style.opacity) < 0.1 || style.visibility === 'hidden' || style.display === 'none') return false;
            }
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && (!text || element.innerText.includes(text));
          }, {selector:step.selector,text:step.type==='assert_text'?step.text:null}, {timeout:10_000});
        } else throw new Error('Unsupported flow step.');
        evidence.push({index,type:step.type,status:'passed',duration_ms:Date.now()-started});
      } catch (cause) {
        error = shortError(cause);
        evidence.push({index,type:step.type,status:'failed',duration_ms:Date.now()-started,message:error});
        break;
      }
    }
  } catch (cause) { error = shortError(cause); }
  try { screenshot = (await page.screenshot({type:'jpeg',quality:55,fullPage:false,timeout:5000})).toString('base64'); } catch { /* Failure evidence still persists when the browser crashes. */ }
  clearTimeout(deadline);
  await context.close().catch(()=>{});
  return {evidence:{attempt,status:error?'failed':'passed',duration_ms:Date.now()-began,steps:evidence,...(error?{error}:{})},...(screenshot?{screenshot:{attempt,base64:screenshot}}:{})};
}

export async function runJob(job, launch = chromium.launch.bind(chromium)) {
  const began = Date.now();
  const origin = new URL(job.site_url).origin;
  if (job.allowed_origin !== origin) throw new Error('Claimed origin does not match the registered website.');
  safeNavigation(job.site_url,origin);
  const host = new URL(origin).hostname;
  if (isIP(host) || host === 'localhost' || !host.includes('.')) throw new Error('A public hostname is required.');
  const addresses = await lookup(host,{all:true,family:4});
  if (!addresses.length || addresses.some(item=>!publicAddress(item.address))) throw new Error('Private or reserved destination blocked.');
  const browser = await launch({headless:true,args:[`--host-resolver-rules=MAP ${host} ${addresses[0].address}`, '--disable-quic']});
  const attempts = [];
  const screenshots = [];
  try {
    for (let attempt=1;attempt<=2;attempt++) {
      const result = await runAttempt(browser,job,attempt);
      attempts.push(result.evidence);
      if (result.screenshot && result.screenshot.base64.length <= 680_000) screenshots.push(result.screenshot);
      if (result.evidence.status === 'passed') break;
    }
  } finally { await browser.close(); }
  const final = attempts.at(-1);
  return {result:{status:classifyAttempts(attempts),attempts:attempts.length,duration_ms:Date.now()-began,steps:final.steps,attempts_detail:attempts,...(final.error?{error:final.error}:{})},screenshots};
}

async function api(body) {
  const requestUrl = new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);
  requestUrl.searchParams.set('audience','aurora-watch');
  const identity = await fetch(requestUrl,{headers:{Authorization:`Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`},signal:AbortSignal.timeout(15_000)});
  if (!identity.ok) throw new Error(`Runner identity request failed: HTTP ${identity.status}`);
  const {value:token} = await identity.json();
  if (!token) throw new Error('Runner identity missing.');
  const response = await fetch(ENDPOINT,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(45_000)});
  if (!response.ok) throw new Error(`Watch API ${body.action} failed: HTTP ${response.status}`);
  return response.json();
}

async function main() {
  const deadline = Date.now()+23*60_000;
  let failed = 0;
  let completed = 0;
  for (let i=0;i<20;i++) {
    if (Date.now() > deadline) break;
    const {jobs} = await api({action:'claim_due',limit:1});
    if (!Array.isArray(jobs)) throw new Error('Invalid claim response.');
    if (!jobs.length) break;
    const job = jobs[0];
    const started = Date.now();
    let outcome;
    try { outcome = await runJob(job); }
    catch (error) { outcome = {result:{status:'inconclusive',attempts:0,duration_ms:Date.now()-started,steps:[],error:shortError(error)}}; }
    // A transport retry uses the same lease/run and is safe because completion is idempotent.
    const body = {action:'complete_flow',run_id:job.run_id,lease_token:job.lease_token,...outcome};
    try { await api(body); } catch { await api(body); }
    completed++;
    if (outcome.result.status !== 'passed') failed++;
    console.log(`Run ${job.run_id}: ${outcome.result.status} (${outcome.result.attempts} attempts)`);
  }
  console.log(`Aurora Watch: ${completed} completed, ${failed} require attention. Evidence is available in the authenticated admin.`);
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error=>{ console.error(shortError(error));process.exitCode=1; });
