// snap.js url out [script-json-steps]: open game in phone viewport, run steps, screenshot
const {chromium}=require('playwright-core');
(async()=>{const [,,url,out,steps]=process.argv;const b=await chromium.launch({executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('ERR',e.message,e.stack));
await p.goto(url);await p.waitForTimeout(500);if(steps){await p.evaluate(steps);}await p.waitForTimeout(300);await p.screenshot({path:out});await b.close();})();
