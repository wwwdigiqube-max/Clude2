import { registerRoot } from "remotion";
import { makeDevRoot } from "./v02/devroot";
import { SceneMaskA, SceneRoom } from "./v02/scenesA";

registerRoot(makeDevRoot("A", { maskA: SceneMaskA, room: SceneRoom }));
