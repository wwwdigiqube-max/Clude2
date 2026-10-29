import { registerRoot } from "remotion";
import { makeDevRoot } from "./v02/devroot";
import { SceneBlack1, SceneTable, SceneTwoMasks } from "./v02/scenesB";

registerRoot(makeDevRoot("B", { table: SceneTable, twoMasks: SceneTwoMasks, black1: SceneBlack1 }));
