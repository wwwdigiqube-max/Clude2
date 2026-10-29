// Binary assets for video 18, loaded once per process (module cache) and held with delayRender.
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

const cache = new Map<string, Promise<Float32Array>>();
export function loadBin(file: string) {
  let p = cache.get(file);
  if (!p) {
    p = fetch(staticFile(file)).then((r) => {
      if (!r.ok) throw new Error(`${file}: ${r.status}`);
      return r.arrayBuffer();
    }).then((b) => new Float32Array(b));
    cache.set(file, p);
  }
  return p;
}

import * as THREE from "three";
const texCache = new Map<string, Promise<THREE.Texture>>();
export function loadTex(file: string) {
  let p = texCache.get(file);
  if (!p) { p = new THREE.TextureLoader().loadAsync(staticFile(file)); texCache.set(file, p); }
  return p;
}
export type Assets18 = { web: Float32Array; zel: Float32Array; day: THREE.Texture; night: THREE.Texture; clouds: THREE.Texture; mw: THREE.Texture };
/** Everything video 18 needs, loaded before the canvas mounts. */
export function useAssets18() {
  const [data, setData] = useState<Assets18 | null>(null);
  const [handle] = useState(() => delayRender("load v18 assets", { timeoutInMilliseconds: 180000 }));
  useEffect(() => {
    let live = true;
    Promise.all([loadBin("styles/cosmic-web/web.bin"), loadBin("styles/cosmic-web/zel.bin"), loadTex("styles/cosmic-web/earth_day.jpg"), loadTex("styles/cosmic-web/earth_night.jpg"), loadTex("styles/cosmic-web/earth_clouds.jpg"), loadTex("styles/cosmic-web/img/milkyway_eso0932a.jpg")])
      .then(([web, zel, day, night, clouds, mw]) => { if (live) setData({ web, zel, day, night, clouds, mw }); continueRender(handle); })
      .catch((e) => cancelRender(e));
    return () => { live = false; };
  }, [handle]);
  return data;
}

/** Float32Array of a public/ binary, or null until loaded (render waits via delayRender). */
export function useBin(file: string) {
  const [data, setData] = useState<Float32Array | null>(null);
  const [handle] = useState(() => delayRender(`load ${file}`, { timeoutInMilliseconds: 120000 }));
  useEffect(() => {
    let live = true;
    loadBin(file).then((d) => { if (live) setData(d); continueRender(handle); }).catch((e) => cancelRender(e));
    return () => { live = false; };
  }, [file, handle]);
  return data;
}
