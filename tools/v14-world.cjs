// Run inside the textures folder (it reads src/bm07.jpg there), e.g.
//   cd public/styles/satellite-explainer && node ../../../tools/v14-world.cjs
// full-world texture (lon -180..180, lat 90..-90) with the same teal ocean grade, 4096×2048
const fs=require('fs');const {execFileSync}=require('child_process');
const W=4096,H=2048;
const raw=execFileSync('ffmpeg',['-v','error','-i','src/bm07.jpg','-vf',`scale=${W}:${H}:flags=lanczos`,'-f','rawvideo','-pix_fmt','rgb24','-'],{maxBuffer:1<<28});
const out=Buffer.alloc(W*H*3);const deep=[20,78,96],mid=[44,120,134],shallow=[120,188,190];
const lerp=(a,b,t)=>a+(b-a)*t;const cl=v=>v<0?0:v>255?255:v;
for(let i=0;i<W*H;i++){const r=raw[i*3],g=raw[i*3+1],b=raw[i*3+2];
  const oc=Math.min(1,Math.max(0,(b/(Math.max(r,g)+4)-1.08)/0.35));
  const l=(r+g+b)/3;let lr=l+(r-l)*1.15,lg=l+(g-l)*1.15,lb=l+(b-l)*1.15;
  lr=255*Math.pow(cl(lr)/255,0.88);lg=255*Math.pow(cl(lg)/255,0.88);lb=255*Math.pow(cl(lb)/255,0.88);
  const t=Math.min(1,Math.max(0,(b-35)/170));const c=t<0.5?[0,1,2].map(k=>lerp(deep[k],mid[k],t*2)):[0,1,2].map(k=>lerp(mid[k],shallow[k],(t-0.5)*2));
  out[i*3]=cl(lerp(lr,c[0],oc));out[i*3+1]=cl(lerp(lg,c[1],oc));out[i*3+2]=cl(lerp(lb,c[2],oc));}
fs.writeFileSync('w.rgb',out);execFileSync('ffmpeg',['-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',`${W}x${H}`,'-i','w.rgb','-q:v','2','world.jpg']);fs.unlinkSync('w.rgb');console.log('world.jpg');
