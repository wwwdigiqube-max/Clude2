// Ready poses for the robed silhouette rig (engine/figure.ts). Blend with mixPose(a, b, k) on word cues.
import { P, Pose } from "./engine/figure";

export const POSE = {
  /** sitting, hugging the knees, head down (alone, sad) */
  sitHug: P({ hipY: 0.07, torso: 0.36, head: 0.75, thF: 2.55, shF: 0.3, thB: 2.35, shB: 0.2, arF: 1.35, elF: 0.95, arB: 1.2, elB: 0.95 }),
  /** sitting up, looking up */
  sitUp: P({ hipY: 0.07, torso: 0.18, head: -0.35, thF: 2.3, shF: 0.2, thB: 2.15, shB: 0.1, arF: 1.25, elF: 0.4, arB: 1.0, elB: 0.5 }),
  /** kneeling on one knee */
  kneel: P({ hipY: 0.3, torso: 0.08, head: -0.3, thF: 1.45, shF: 0.0, thB: 0.25, shB: -1.35, arF: 0.9, elF: 0.4, arB: 0.2, elB: 0.2 }),
  /** kneeling, hiding the face (awe) */
  kneelHide: P({ hipY: 0.3, torso: 0.45, head: 0.7, thF: 1.45, shF: 0.0, thB: 0.25, shB: -1.35, arF: 2.3, elF: 1.9, arB: 0.6, elB: 0.6 }),
  /** reaching out toward something */
  reach: P({ torso: -0.06, head: -0.32, arF: 1.85, elF: 0.15, arB: 0.2, elB: 0.2 }),
  /** an arm up over the eyes (too bright) */
  shield: P({ torso: 0.12, head: 0.35, arF: 2.7, elF: 1.6, arB: 1.2, elB: 1.4, thF: 0.12, thB: -0.12 }),
  /** looking up, open hands */
  lookUp: P({ head: -0.5, torso: -0.08, arF: 0.5, elF: 0.6, arB: -0.2, elB: 0.2 }),
  /** bowed to the ground */
  bow: P({ hipY: 0.24, torso: 1.05, head: 0.35, thF: 0.75, shF: -1.45, thB: 0.6, shB: -1.5, arF: 0.9, elF: 0.4, arB: 0.8, elB: 0.4 }),
  /** standing open, arms a little out (a figure of light) */
  open: P({ torso: -0.03, head: -0.12, arF: 0.75, elF: 0.15, arB: -0.6, elB: -0.1 }),
  /** seated on a throne */
  seat: P({ hipY: 0.3, torso: -0.02, head: 0.02, thF: 1.45, shF: 0.05, thB: 1.4, shB: 0.0, arF: 0.75, elF: 0.6, arB: 0.6, elB: 0.6 }),
} satisfies Record<string, Pose>;
