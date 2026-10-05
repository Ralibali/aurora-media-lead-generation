import test from 'node:test';
import assert from 'node:assert/strict';
import { safeNavigation, publicAddress, requestAllowed, classifyAttempts } from './aurora-watch-runner.mjs';
const origin = 'https://auroramedia.se';
test('public customer path accepts same-origin navigation and denies side effects and credentials',()=>{
  assert.equal(safeNavigation('/kontakt',origin),origin+'/kontakt');
  for(const path of ['https://example.com/','http://auroramedia.se/','https://user:pass@auroramedia.se/','/log-out','/unsubscribe?id=1','/%64elete','/kontakt?token=secret','javascript:alert(1)']) assert.throws(()=>safeNavigation(path,origin),path);
});
test('request guard prevents POST/PUT, cross-origin assets, redirects and internal access',()=>{
  assert.equal(requestAllowed(origin+'/assets/app.js','GET',origin),true);
  for(const [url,method] of [[origin+'/','POST'],[origin+'/','PUT'],['https://evil.test/pixel','GET'],['http://169.254.169.254/','GET'],[origin+'/delete','GET'],[origin+'/?access_token=x','GET']]) assert.equal(requestAllowed(url,method,origin,true),false);
});
test('network destinations must be public IPv4; rebinding targets are rejected',()=>{
  assert.equal(publicAddress('104.18.10.20'),true);
  for(const ip of ['127.0.0.1','10.0.0.2','172.16.0.1','172.31.9.8','192.168.1.2','169.254.169.254','100.64.0.1','198.18.0.1','::1','::ffff:127.0.0.1','0.0.0.0','224.0.0.1']) assert.equal(publicAddress(ip),false,ip);
});
test('retry success is unstable, never silently healthy',()=>{
  assert.equal(classifyAttempts([{status:'passed'}]),'passed');
  assert.equal(classifyAttempts([{status:'failed'},{status:'passed'}]),'flaky');
  assert.equal(classifyAttempts([{status:'failed'},{status:'failed'}]),'failed');
});
test('encoded secret query keys cannot bypass navigation or request protection',()=>{
  for (const key of ['%74oken','access%5ftoken','%41CTION','pass%77ord','%73ecret']) {
    const url=origin+'/kontakt?'+key+'=private';
    assert.throws(()=>safeNavigation(url,origin));
    assert.equal(requestAllowed(url,'GET',origin),false);
  }
});
