// Run inside the textures folder (it reads landmask.png there), e.g.
//   cd public/styles/satellite-explainer && node ../../../tools/v14-heat.cjs
// SST-anomaly style heat maps on the v14 map strip (lon 60E→0, lat 75N→65S), 16 px/deg, land transparent.
const fs=require('fs');const {execFileSync}=require('child_process');
const W=4800,H=2240,S=16;
const mask=execFileSync('ffmpeg',['-v','error','-i','landmask.png','-vf',`scale=${W}:${H}`,'-f','rawvideo','-pix_fmt','gray','-'],{maxBuffer:1<<28});
const hash=(x,y,s)=>{let h=(x*374761393+y*668265263+s*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295};
const sm=t=>t*t*(3-2*t);
const vnoise=(x,y,s)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=sm(x-xi),yf=sm(y-yi);
  const a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s);return a+(b-a)*xf+(c-a)*yf+(a-b-c+d)*xf*yf};
const fbm=(x,y,s)=>{let v=0,a=0.5,f=1;for(let o=0;o<6;o++){v+=a*vnoise(x*f,y*f,s+o*17);f*=2.07;a*=0.5}return v};
const stops=[[-1,[40,60,190]],[-0.45,[80,190,230]],[-0.1,[200,238,240]],[0.12,[245,240,200]],[0.32,[250,220,80]],[0.6,[245,140,35]],[0.95,[215,35,30]],[1.35,[120,0,35]]];
const col=v=>{if(v<=stops[0][0])return stops[0][1];for(let i=1;i<stops.length;i++)if(v<=stops[i][0]){const[a,ca]=stops[i-1],[b,cb]=stops[i];const t=(v-a)/(b-a);return ca.map((c,k)=>c+(cb[k]-c)*t)}return stops.at(-1)[1]};
const g=(x,m,s)=>Math.exp(-((x-m)**2)/(2*s*s));
function make(name,field,landAlpha){
  const out=Buffer.alloc(W*H*4);
  for(let y=0;y<H;y++){const lat=75-y/S;for(let x=0;x<W;x++){let lon=60+x/S;if(lon>180)lon-=360;
    const n=fbm(x/90,y/90,1),sp=fbm(x/14,y/14,7);const v=field(lon,lat,n,sp);const c=col(v);const i=y*W+x;
    const land=mask[i]/255;out[i*4]=c[0];out[i*4+1]=c[1];out[i*4+2]=c[2];out[i*4+3]=Math.round(255*(1-land*(1-landAlpha)))}}
  fs.writeFileSync('h.raw',out);
  execFileSync('ffmpeg',['-v','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-i','h.raw',name]);fs.unlinkSync('h.raw');console.log(name);
}
const dlon=(a,b)=>{let d=a-b;while(d>180)d-=360;while(d<-180)d+=360;return d};
// El Niño: warm tongue along the equator, strongest off South America; warm blob in the NE Pacific; speckle everywhere
make('sst_nino.png',(lon,lat,n,sp)=>{
  const inPac=lon>150?1:lon<0?Math.max(0,Math.min(1,(-77-lon)/6)):0;const tongue=inPac*g(lat,-1,5.5+3*n)*Math.max(0,Math.min(1,(dlon(lon,160)+10)/60))*1.25*(0.8+0.4*n);
  const coast=(lon<-76?1:0)*g(lat,-5,12)*g(dlon(lon,-82),0,10)*0.5;
  const ne=g(lat,38,9)*g(dlon(lon,-150),0,20)*0.8;
  const south=g(lat,-35,8)*g(dlon(lon,-120),0,25)*0.45;
  return -0.15+0.55*(n-0.5)+0.7*(sp-0.5)+tongue+coast+ne+south;},0);
// 2027: warm almost everywhere, land tinted too
make('sst_hot.png',(lon,lat,n,sp)=>0.55+0.7*(n-0.5)+0.8*(sp-0.5)+0.35*g(lat,0,15),0.55);
