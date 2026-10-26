import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const baseUrl=(process.env.SCREENSHOT_BASE_URL||'https://jonpedder.github.io/ca_security_ops').replace(/\/$/,'');
const storageState=process.env.SCREENSHOT_STORAGE_STATE||'';
if(!storageState)throw new Error('SCREENSHOT_STORAGE_STATE must point to an authenticated Playwright storage-state JSON file.');

async function waitForDeployment(path,localFile){
  const expected=(await readFile(localFile,'utf8')).replace(/\r\n/g,'\n').trim();
  const deadline=Date.now()+Number(process.env.DEPLOY_WAIT_MS||300000);
  while(Date.now()<deadline){
    try{
      const response=await fetch(`${baseUrl}/${path}?screenshot_build=${Date.now()}`,{headers:{'cache-control':'no-cache'}});
      const actual=(await response.text()).replace(/\r\n/g,'\n').trim();
      if(response.ok&&actual===expected)return;
    }catch{}
    await new Promise(resolve=>setTimeout(resolve,10000));
  }
  throw new Error(`Timed out waiting for ${path} to match the current commit on GitHub Pages.`);
}

await waitForDeployment('index.html',resolve('index.html'));
await waitForDeployment('approval.html',resolve('approval.html'));
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({storageState,viewport:{width:1424,height:945},deviceScaleFactor:1});

async function capture(path,output,ready){
  const page=await context.newPage();
  await page.goto(`${baseUrl}/${path}?screenshot_build=${Date.now()}`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.fonts?.status==='loaded');
  await page.waitForSelector(ready,{state:'visible',timeout:60000});
  await page.waitForTimeout(2500);
  const authVisible=await page.locator('.auth-screen:not([hidden]),.auth:not([hidden])').count();
  if(authVisible)throw new Error(`${path} is still showing its sign-in screen. Refresh the SCREENSHOT_STORAGE_STATE_B64 repository secret.`);
  await page.screenshot({path:output,fullPage:false});
  await page.close();
}

await capture('index.html','help/operations-map-live.png','.app');
await capture('approval.html','help/incident-approval-live.png','.app');
await browser.close();
console.log('Refreshed live help screenshots.');
