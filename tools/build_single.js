// inline all src/*.js into one self-contained HTML (runs offline, no network)
const fs=require('fs');const root='/workspace/idle-town';let h=fs.readFileSync(root+'/index.html','utf8');
h=h.replace(/<script src="(src\/[^"]+)"><\/script>/g,(m,f)=>'<script>\n'+fs.readFileSync(root+'/'+f,'utf8').replace(/<\/script/g,'<\\/script')+'\n</script>');
fs.mkdirSync(root+'/dist',{recursive:true});fs.writeFileSync(root+'/dist/idle-town.html',h);console.log('dist/idle-town.html',h.length,'bytes');
