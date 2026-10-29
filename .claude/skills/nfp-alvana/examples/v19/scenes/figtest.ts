// Look-dev sheet for the character rig (not in the film).
import { Ctx } from "../lib/canvas";
import { figure, P, STAND, walk } from "../lib/figure";
import { painterly } from "../lib/fx";
import { lightBeing } from "../lib/light";

const SIT_HUG = P({ hipY: 0.07, torso: 0.36, head: 0.75, thF: 2.55, shF: 0.3, thB: 2.35, shB: 0.2, arF: 1.35, elF: 0.95, arB: 1.2, elB: 0.95 });
const KNEEL = P({ hipY: 0.3, torso: 0.08, head: -0.3, thF: 1.45, shF: 0.0, thB: 0.25, shB: -1.35, arF: 0.9, elF: 0.4, arB: 0.2, elB: 0.2 });
const REACH = P({ torso: -0.06, head: -0.32, arF: 1.85, elF: 0.15, arB: 0.2, elB: 0.2 });
const SHIELD = P({ torso: 0.12, head: 0.35, arF: 2.7, elF: 1.6, arB: 1.2, elB: 1.4, thF: 0.12, thB: -0.12 });

export function drawFigTest(ctx: Ctx, t: number) {
  painterly(ctx, t, "#9e6378", "#eaa577", [{ x: 960, y: 500, r: 900, c: "#f2b88a", a: 0.8 }], 1);
  const look = { base: "#3a2434", base2: "#22141e", rim: "#ffb27a", rimW: 5, light: [-1, -0.3] as [number, number] };
  const y = 900;
  figure(ctx, { x: 200, y, h: 420, pose: STAND, t, head: "veil", seed: 1 }, look);
  figure(ctx, { x: 470, y, h: 420, pose: SIT_HUG, t, head: "veil", seed: 2 }, look);
  figure(ctx, { x: 760, y, h: 420, pose: KNEEL, t, head: "veil", seed: 3 }, look);
  figure(ctx, { x: 1030, y, h: 420, pose: REACH, t, head: "veil", seed: 4 }, look);
  figure(ctx, { x: 1280, y, h: 420, pose: SHIELD, t, head: "veil", seed: 5 }, look);
  figure(ctx, { x: 1520, y, h: 420, pose: walk(t * 0.8), t, head: "wrap", beard: true, staff: "F", seed: 6 }, look);
  lightBeing(ctx, null, { x: 1780, y, h: 420, t, k: 1, face: -1 });
}
