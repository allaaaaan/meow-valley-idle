const {chromium}=require('playwright-core');
(async()=>{const [,,url,out,w,h,dpr]=process.argv;const b=await chromium.launch({executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:+w||800,height:+h||600},deviceScaleFactor:+dpr||1});p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(url);await p.waitForTimeout(800);await p.screenshot({path:out,fullPage:true});await b.close();})();
