// anchors [newTime, oldTime] from matching words (LCS per line) between vo_old.json and the current vo.json
const fs=require('fs');const o=require('./vo_old.json'),n=require('../../remotion/src/v14/vo.json');
const norm=w=>w.replace(/[ً-ْ‌.,،؛؟!«»]/g,'');
const s1n=n.segs.find(x=>x.n===1).start,s1o=o.segs.find(x=>x.n===1).start;const A=[[+(s1n-s1o).toFixed(3),0]];
for(const s of n.segs){
  const os=o.segs.find(x=>x.n===s.n);if(!os)continue;A.push([s.start,os.start]);
  const nw=n.words.filter(w=>w.line===s.n),ow=o.words.filter(w=>w.line===s.n);
  const L=Array.from({length:nw.length+1},()=>new Array(ow.length+1).fill(0));
  for(let i=nw.length-1;i>=0;i--)for(let j=ow.length-1;j>=0;j--)L[i][j]=norm(nw[i].w)===norm(ow[j].w)?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  let i=0,j=0;while(i<nw.length&&j<ow.length){if(norm(nw[i].w)===norm(ow[j].w)){A.push([nw[i].s,ow[j].s]);i++;j++}else if(L[i+1][j]>=L[i][j+1])i++;else j++}
  A.push([s.end,os.end]);
}
A.push([n.total,o.total]);
const clean=[];for(const a of A.sort((x,y)=>x[0]-y[0]))if(!clean.length||(a[0]>clean.at(-1)[0]+1e-3&&a[1]>clean.at(-1)[1]+1e-3))clean.push(a.map(v=>+v.toFixed(3)));
fs.writeFileSync('../../remotion/src/v14/timemap.json',JSON.stringify(clean));console.log(clean.length,'anchors');
