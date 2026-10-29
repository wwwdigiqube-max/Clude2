// Style-Documentary-Worlds: 8 stills of the generic `landscape()` world — one per mood/switch set, each with a
// figure lit from the mood's light. Copy any block as the start of a scene for a new topic.
import React from "react";
import { DocCanvas } from "./DocCanvas";
import { Ctx } from "./engine/canvas";
import { castShadow } from "./engine/depth";
import { Fig, figure, walk } from "./engine/figure";
import { lightBeing } from "./engine/light";
import { mixHex } from "./engine/math";
import { F, title } from "./engine/text";
import { POSE } from "./poses";
import { landscape, LandInfo, LandOpt } from "./worlds/landscape";

/** a figure standing on the land, shadow away from the light, rim on the lit side */
export function person(c: Ctx, L: LandInfo, f: Omit<Fig, "y"> & { y?: number }) {
  const y = f.y ?? L.groundY(f.x) + 130;
  const fig = { head: "none" as const, ...f, y };
  const side = Math.sign(L.lightX - f.x) || 1;
  castShadow(c, fig, L.lightX, L.mood.light.y < L.horizon - 250 ? 0.6 : 1.4, 0.45, mixHex(L.mood.ground[1], "#000000", 0.5), 0.18, 6);
  figure(c, fig, { base: mixHex(L.mood.ground[1], "#000000", 0.25), base2: mixHex(L.mood.ground[1], "#000000", 0.55), rim: L.mood.rim, rimW: 4, light: [side, -0.4] });
}

const LOOKS: [string, LandOpt, (c: Ctx, lit: Ctx, L: LandInfo, t: number) => void][] = [
  ["dusk · trees", { mood: "dusk", trees: 0.3 }, (c, _l, L, t) => person(c, L, { x: 900, h: 300, face: 1, pose: POSE.sitHug, t, head: "veil" })],
  ["dawn · water", { mood: "dawn", water: 880 }, (c, _l, L, t) => person(c, L, { x: 700, y: 990, h: 340, face: 1, pose: POSE.lookUp, t })],
  ["day · many clouds · trees", { mood: "day", clouds: "many", trees: 0.8 }, (c, _l, L, t) => person(c, L, { x: 980, h: 330, face: -1, pose: walk(t * 1.2, 1), t })],
  ["night · city", { mood: "night", city: 0.8 }, (c, _l, L, t) => person(c, L, { x: 1050, h: 340, face: -1, pose: POSE.lookUp, t })],
  ["storm · city", { mood: "storm", clouds: "many", city: 0.4 }, (c, _l, L, t) => person(c, L, { x: 960, h: 340, face: 1, pose: POSE.shield, t, wind: 1 })],
  ["fog · water · trees", { mood: "fog", water: 860, trees: 0.5 }, (c, _l, L, t) => person(c, L, { x: 1000, y: 985, h: 320, face: -1, pose: POSE.bow, t })],
  ["heaven", { mood: "heaven", trees: 0.2 }, (c, lit, L, t) => {
    lightBeing(c, lit, { x: 1280, y: L.groundY(1280) + 110, h: 430, t, k: 1, face: -1, warm: 0.15 });
    person(c, L, { x: 800, h: 320, face: 1, pose: POSE.kneel, t, head: "veil" });
  }],
  ["dusk → night (50%) · city", { mood: "dusk", to: ["night", 0.5], city: 0.6 }, (c, _l, L, t) => person(c, L, { x: 900, h: 330, face: 1, pose: walk(t, 0.8), t })],
];
export const WORLD_LOOKS = LOOKS.length;

export function worldsFrame(c: Ctx, t: number) {
  const i = Math.min(LOOKS.length - 1, Math.round(t * 30));
  const [name, o, draw] = LOOKS[i];
  const tl = 6 + i * 3;
  landscape(c, tl, { x: 960, y: 540, z: 1 }, { ...o, seed: 1 + i }, (cc, lit, L) => draw(cc, lit, L, tl));
  title(c, [{ s: name, f: F.bold }], 80, 80, { size: 34, k: 1, align: "left", shade: 0.4 });
}
export const DocumentaryWorlds: React.FC = () => <DocCanvas render={worldsFrame} />;
