// Video 18 world: builds every layer once, then each frame applies direct(t) (pure) to camera, layers and post.
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Assets18 } from "./assets";
import { applyView, len, pxScale, sub, type Layer, type V3 } from "./cam";
import { BOO, PAIR, V2, direct, type State } from "./director";
import { makeBubbles } from "./bubbles";
import { makeCmb, makeFill, makeSolo, makeVoidGals, makeZel } from "./fields";
import { MWC, makeLocalGroup } from "./lgroup";
import { AU, EARTH_R, makeEarth, makeNeighbours, makeSky, makeSolar } from "./near";
import { makePost } from "./post";
import type { PtsU } from "./pts";
import { makeWeb } from "./web";
import { SUN } from "./director";

export const World18: React.FC<{ t: number; a: Assets18 }> = ({ t, a }) => {
  const { gl, scene, camera, size } = useThree();
  const W = useMemo(() => {
    scene.clear();
    const sky = makeSky(a.mw);
    const earth = makeEarth({ day: a.day, night: a.night, clouds: a.clouds });
    const solar = makeSolar();
    const nbr = makeNeighbours();
    const lg = makeLocalGroup();
    const web = makeWeb(a.web, size.width, size.height);
    const fill = makeFill();
    const zel = makeZel(a.zel);
    const cmb = makeCmb();
    const solo = makeSolo();
    const vgal = makeVoidGals(V2.c, V2.r);
    const bubbles = makeBubbles(14);
    const fieldGroup = new THREE.Group();
    fieldGroup.add(cmb.mesh, zel.group);
    const soloGroup = new THREE.Group();
    soloGroup.add(solo.blue.group, solo.spiral.group);
    for (const o of [web.dens.quad, sky.group, earth.group, solar.group, nbr.obj, lg.group, web.group, fill.obj, fieldGroup, soloGroup, vgal.group, bubbles.group]) scene.add(o);
    const post = makePost(gl, scene, camera as THREE.PerspectiveCamera, size.width, size.height);
    // hidden until our first directed frame: ThreeCanvas may draw once on creation, without post (raw, ungraded)
    scene.visible = false;
    return { sky, earth, solar, nbr, lg, web, fill, zel, cmb, solo, vgal, bubbles, fieldGroup, soloGroup, post };
  }, [a, gl, scene, camera, size.width, size.height]);
  useEffect(() => () => { W.post.dispose(); W.web.dens.dispose(); scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); }); }, [W, scene]);

  useFrame(() => {
    scene.visible = true;
    const st: State = direct(t);
    const cam = camera as THREE.PerspectiveCamera;
    const px = pxScale(st.view.fov, size.height);
    // visibility
    W.sky.group.visible = !!st.sky && st.sky.fade > 0.001;
    W.earth.group.visible = !!st.earth && st.earth.fade > 0.001;
    W.solar.group.visible = !!st.solar && st.solar.fade > 0.001;
    W.nbr.obj.visible = !!st.nbr && st.nbr.fade > 0.001;
    W.lg.group.visible = !!st.lg && Math.max(st.lg.mw, st.lg.others, st.lg.halo, st.lg.merged) > 0.001;
    W.web.group.visible = !!st.web && st.web.fade > 0.001;
    // the density layer must be visible before applyView, or it keeps a stale transform for one frame
    const webOn = W.web.group.visible;
    W.web.dens.group.visible = webOn;
    W.web.dens.quad.visible = webOn;
    // void outlines are 3D bubbles (set before applyView so their transforms update this frame)
    W.bubbles.set(st.ov.rings.filter((r) => r.k > 0.001), t);
    W.fill.obj.visible = !!st.fill && st.fill.fade > 0.001;
    W.fieldGroup.visible = (!!st.zel && st.zel.fade > 0.001) || (!!st.cmb && st.cmb.fade > 0.001);
    W.soloGroup.visible = !!st.solo && st.solo.fade > 0.001;
    W.vgal.group.visible = !!st.vgal && st.vgal > 0.001;
    const lgAt: V3 = st.lg?.at ?? MWC;
    const layers: Layer[] = [
      { obj: W.earth.group, origin: [0, 0, 0], unit: EARTH_R },
      { obj: W.solar.group, origin: SUN, unit: AU, onK: (k) => W.solar.uniforms.forEach((u) => { u.uPx.value = px; u.uK.value = k; }) },
      { obj: W.nbr.obj, origin: SUN, unit: 1, onK: (k) => { W.nbr.u.uPx.value = px; W.nbr.u.uK.value = k; } },
      { obj: W.lg.group, origin: lgAt, unit: 1, onK: (k) => W.lg.frame(px, k) },
      { obj: W.web.group, origin: [0, 0, 0], unit: 1, onK: (k) => { W.web.both("uPx", px); W.web.both("uK", k); } },
      { obj: W.web.dens.group, origin: [0, 0, 0], unit: 1 },
      { obj: W.bubbles.group, origin: [0, 0, 0], unit: 1 },
      { obj: W.fill.obj, origin: [0, 0, 0], unit: 1, onK: (k) => { W.fill.u.uPx.value = px; W.fill.u.uK.value = k; } },
      { obj: W.fieldGroup, origin: [0, 0, 0], unit: 1, onK: (k) => { W.zel.U.uPx.value = px; W.zel.U.uK.value = k; } },
      { obj: W.soloGroup, origin: [0, 0, 0], unit: 1, onK: (k) => { W.solo.blue.frame(px, k); W.solo.spiral.frame(px, k); } },
      { obj: W.vgal.group, origin: [0, 0, 0], unit: 1, onK: (k) => { for (const u of [W.vgal.u, W.vgal.g]) { u.uPx.value = px; u.uK.value = k; u.uFade.value = st.vgal ?? 0; u.uAper.value = 3; u.uFocus.value = 10; } } },
    ];
    const k = applyView(cam, st.view, layers, size.width / size.height);
    // sky sits around the camera
    if (st.sky) {
      W.sky.group.position.set(0, 0, 0);
      W.sky.group.scale.setScalar(1);
      // another world's sky: the same kind of galaxy band, seen from elsewhere and a little bluer
      const alien = (st.sky.tilt ?? 0) > 0.5;
      W.sky.group.rotation.set(alien ? 0.7 : 0, alien ? 2.3 : 0, alien ? -0.5 : 0);
      W.sky.bandU.tint.value.set(alien ? 0.8 : 1, alien ? 0.9 : 1, 1);
      W.sky.group.updateMatrixWorld(true);
      W.sky.su.uPx.value = px; W.sky.su.uK.value = 1;
      W.sky.su.uFade.value = st.sky.fade;
      W.sky.bandU.fade.value = st.sky.fade;
      W.sky.bandU.gain.value = st.sky.band ?? 1;
    }
    if (st.earth) {
      W.earth.U.fade.value = st.earth.fade;
      W.earth.U.spin.value = st.earth.spin;
      const sd = sub(SUN, [0, 0, 0]);
      W.earth.U.sun.value.set(sd[0], sd[1], sd[2]).normalize();
    }
    if (st.solar) W.solar.setFade(st.solar.fade);
    if (st.nbr) W.nbr.u.uFade.value = st.nbr.fade;
    if (st.lg) {
      W.lg.fade.mw = st.lg.mw; W.lg.fade.others = st.lg.others; W.lg.fade.halo = st.lg.halo;
      W.lg.setFade();
      W.lg.merged.group.visible = st.lg.merged > 0.001;
      W.lg.merged.both("uFade", st.lg.merged);
      const sp = (st.lg.spin ?? t) * 0.006;
      W.lg.mw.spin.rotation.y = sp; W.lg.m31.spin.rotation.y = sp * 0.6; W.lg.m33.spin.rotation.y = sp * 1.3; W.lg.merged.spin.rotation.y = sp * 0.3;
      // in the Boötes "what if" shot only the Milky Way is drawn, without the dwarfs and halo
      W.lg.dwarfs.visible = st.lg.others > 0.001;
    }
    if (st.web) {
      const w = st.web, du = W.web.du;
      const lookD = 10; // render units to the look point
      W.web.both("uFocus", lookD);
      W.web.both("uDRef", lookD);
      W.web.both("uFade", w.fade);
      W.web.both("uAper", w.aper ?? 0);
      W.web.both("uWin", w.win ? w.win * k : 0);
      W.web.both("uMaskR", w.mask ?? 0);
      W.web.both("uNear", w.near ? w.near * k : 0);
      if (w.slab) { du.uSlabN.value.set(...w.slab.n); W.web.both("uSlabW", w.slab.w); W.web.both("uSlabT", w.slab.t); } else W.web.both("uSlabT", 0);
      // sparkles (brightest galaxies) — a light touch on top of the density render
      du.uGain.value = (w.gain ?? 2.6) * 0.45;
      const cls = w.cls ?? [0.12, 0.7, 1.0, 1.4];
      du.uCls.value.set(...cls);
      W.web.both("uRecede", w.recede ?? 0);
      W.web.both("uRecR", 8);
      const inf = w.inf ?? { k: 0, tear: 0 };
      const [va, vb] = PAIR;
      du.uInf0.value.set(va.c[0], va.c[1], va.c[2], va.r); du.uInf1.value.set(vb.c[0], vb.c[1], vb.c[2], vb.r);
      W.web.both("uInfK", inf.k);
      W.web.both("uTearK", inf.tear);
      // density exposure: expected matter per pixel ∝ depth of the visible slice × (Mly per pixel)²
      const D = len(sub(st.view.look, st.view.pos));
      const pix = (2 * D * Math.tan((st.view.fov * Math.PI) / 360)) / size.height;
      const depth = w.slab ? 2 * w.slab.t * 0.75 : w.win ? 1.77 * w.win : w.mask ? 1.4 * w.mask : 1500;
      // calibrated on two shots (sparse close-up vs. dense far view): splats stop overlapping when close, so ~pix^0.36
      W.web.dens.CU.uExp.value = ((w.dexp ?? 1) * 4200) / Math.max(1e-6, Math.sqrt(depth) * Math.pow(pix, 0.36));
      W.web.dens.setSub(pix < 0.35 ? 12 : pix < 1 ? 7 : 3);
      const hi = w.hi ?? { c: [0, 0, 0] as V3, r: 1, k: 0 };
      W.web.dens.extra.uHiC.value.set(hi.c[0], hi.c[1], hi.c[2]); W.web.dens.extra.uHiR.value = hi.r; W.web.dens.extra.uHiK.value = hi.k;
    }
    if (st.fill) {
      W.fill.u.uFade.value = st.fill.fade;
      W.fill.u.uCls.value.set(1 - st.fill.keep, 1, 1, 1 + 1.5 * st.fill.keep);
      W.fill.u.uAper.value = 4; W.fill.u.uFocus.value = 10;
    }
    if (st.zel) {
      W.zel.U.uD.value = st.zel.D; W.zel.U.uRip.value = st.zel.ripple; W.zel.U.uFade.value = st.zel.fade; W.zel.U.uGain.value = st.zel.gain ?? 1;
      W.zel.U.uHaze.value = Math.min(1, Math.max(0, (st.zel.D - 0.5) / 0.7));
      W.zel.group.visible = st.zel.fade > 0.001;
    } else W.zel.group.visible = false;
    W.cmb.mesh.visible = !!st.cmb && st.cmb.fade > 0.001;
    if (st.cmb) {
      W.cmb.U.uFade.value = st.cmb.fade; W.cmb.U.uSpot.value = st.cmb.spot;
      W.cmb.mesh.scale.setScalar(st.cmb.zoom);
      W.cmb.mesh.position.set(-(st.cmb.zoom - 1) * 22, (st.cmb.zoom - 1) * 9, -0.5);
    }
    if (st.solo) {
      W.solo.blue.group.visible = st.solo.kind === "blue";
      W.solo.spiral.group.visible = st.solo.kind === "spiral";
      W.solo.blue.both("uFade", st.solo.fade); W.solo.spiral.both("uFade", st.solo.fade);
      W.solo.blue.spin.rotation.y = st.solo.spin * 0.02; W.solo.spiral.spin.rotation.y = st.solo.spin * 0.012;
    }
    // post
    const g = W.post.grade;
    g.set("exposure", st.post.exposure);
    g.set("black", st.post.black);
    g.set("vig", st.post.vig ?? 0.35);
    g.set("seed", t);
    W.post.bloom.intensity = st.post.bloom ?? 0.9;
    void BOO; void ({} as PtsU);
    if (webOn) W.web.dens.draw(gl, cam);
    W.post.render();
  }, 1);
  return null;
};
