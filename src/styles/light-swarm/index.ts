// Light Swarm — light particles that build symbols on the beat (16:9, music only, no text).
export * from "./theme";
export { buildSwarmEngine, DEFAULT_DENS, type SwarmEngine, type SwarmOptions } from "./engine";
export { SHAPES, SHAPE_LIB, CAT, buildShapeTexture, fillPaths, haze, put, bez2, bez3, circle, sphere, jit, type ShapeName, type ShapeGen, type Path, type V3 } from "./shapes";
export { applyCamera, applyTransition, cameraSpline, flying, glitchAt, transitionAt, type CamKey, type Transition } from "./timeline";
export { makeSegSystem, stripsToSegs } from "./segs";
export { makeNebula } from "./nebula";
export { LightSwarmDemo, SWARM_DEMO_FRAMES } from "./Demo";
