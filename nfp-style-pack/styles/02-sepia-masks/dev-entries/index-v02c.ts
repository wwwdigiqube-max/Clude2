import { registerRoot } from "remotion";
import { makeDevRoot } from "./v02/devroot";
import { SceneBlack2, SceneHands, SceneHourglass, SceneHourglassClose, SceneStatic } from "./v02/scenesC";

registerRoot(makeDevRoot("C", { hourglass: SceneHourglass, hourglassClose: SceneHourglassClose, black2: SceneBlack2, hands: SceneHands, static: SceneStatic }));
