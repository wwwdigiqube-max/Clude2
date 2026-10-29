import "./index.css";
import "./fonts";
import { Composition } from "remotion";
import { LAUNCH_DEMO_FRAMES, LaunchReelDemo } from "./styles/launch-reel/Demo";
import { DEMO_FRAMES, PaperBlueprintDemo } from "./styles/paper-blueprint/Demo";
import { LightSwarmDemo, SWARM_DEMO_FRAMES } from "./styles/light-swarm";
import { DOC_DEMO_FRAMES, DocumentaryDemo, DocumentaryWorlds, WORLD_LOOKS } from "./styles/documentary";
import { STARTER_FRAMES, StarterVideo } from "./styles/documentary/starter/Video";
import { HOLO_FPS, HOLO_FRAMES, HOLO_LOOK, HoloVideo } from "./styles/hologram-hud";
import { ATOMIC_FPS, ATOMIC_FRAMES, ATOMIC_LOOK, AtomicVideo } from "./styles/atomic-age";
import { REEL_FPS, REEL_FRAMES, REEL_LOOK, ReelVideo } from "./styles/test-reel";
import { STICK_FPS, STICK_FRAMES, StickVideo } from "./styles/stick-toon";
import { SAT_FPS, SAT_FRAMES, SatelliteVideo } from "./styles/satellite-explainer";
import { COSMIC_FPS, COSMIC_FRAMES, COSMIC_LOOK, CosmicVideo } from "./styles/cosmic-web";
import { FLAP_FPS, FLAP_FRAMES, FLAP_LOOK, FlapVideo } from "./styles/split-flap";
import { LIGHTLOGO_FPS, LIGHTLOGO_FRAMES, LIGHTLOGO_LOOK, LightLogoVideo } from "./styles/light-logo";
import { DESK_FPS, DESK_FRAMES, DESK_LOOK, DeskVideo } from "./styles/studio-desk";

// Every video = one <Composition>. The style demos below are the reference films / starter templates (see STYLES.md).
// They play silent: the films’ narration, music and effects are not shipped — each style’s pipeline/ folder says how to make yours.
// For each video of yours, register three: the film (with audio, for the Studio), "-Silent" (to render, then mux the
// mix) and "-Look" (a list of still times, to check frames cheaply before a full render).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* vertical narrated styles — demo = the reference film itself (silent) */}
      <Composition id="Style-HologramHUD" component={HoloVideo} durationInFrames={HOLO_FRAMES} fps={HOLO_FPS} width={1080} height={1920} />
      <Composition id="Style-HologramHUD-Look" component={HoloVideo} durationInFrames={HOLO_LOOK.length} fps={HOLO_FPS} width={1080} height={1920} defaultProps={{ times: HOLO_LOOK }} />
      <Composition id="Style-AtomicAge" component={AtomicVideo} durationInFrames={ATOMIC_FRAMES} fps={ATOMIC_FPS} width={1080} height={1920} />
      <Composition id="Style-AtomicAge-Look" component={AtomicVideo} durationInFrames={ATOMIC_LOOK.length} fps={ATOMIC_FPS} width={1080} height={1920} defaultProps={{ times: ATOMIC_LOOK }} />
      <Composition id="Style-TestReel" component={ReelVideo} durationInFrames={REEL_FRAMES} fps={REEL_FPS} width={1080} height={1920} />
      <Composition id="Style-TestReel-Look" component={ReelVideo} durationInFrames={REEL_LOOK.length} fps={REEL_FPS} width={1080} height={1920} defaultProps={{ times: REEL_LOOK }} />
      <Composition id="Style-Satellite" component={SatelliteVideo} durationInFrames={SAT_FRAMES} fps={SAT_FPS} width={1080} height={1920} />
      <Composition id="Style-StickToon" component={StickVideo} durationInFrames={STICK_FRAMES} fps={STICK_FPS} width={1080} height={1920} />
      <Composition id="Style-LaunchReel" component={LaunchReelDemo} durationInFrames={LAUNCH_DEMO_FRAMES} fps={30} width={1080} height={1920} />
      {/* Studio Desk: the course reel; your footage goes in demo/lib.ts → MEDIA (empty slots show placeholders) */}
      <Composition id="Style-StudioDesk" component={DeskVideo} durationInFrames={DESK_FRAMES} fps={DESK_FPS} width={1080} height={1920} />
      <Composition id="Style-StudioDesk-Look" component={DeskVideo} durationInFrames={DESK_LOOK.length} fps={DESK_FPS} width={1080} height={1920} defaultProps={{ times: DESK_LOOK }} />
      {/* horizontal */}
      <Composition id="Style-PaperBlueprint" component={PaperBlueprintDemo} durationInFrames={DEMO_FRAMES} fps={30} width={1920} height={1080} />
      {/* two-voice documentary (Canvas 2D): Starter = template for any topic · Worlds = 8 ready places · Documentary = reference-content demo */}
      <Composition id="Style-Documentary-Starter" component={StarterVideo} durationInFrames={STARTER_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Style-Documentary-Worlds" component={DocumentaryWorlds} durationInFrames={WORLD_LOOKS} fps={30} width={1920} height={1080} />
      <Composition id="Style-Documentary" component={DocumentaryDemo} durationInFrames={DOC_DEMO_FRAMES} fps={30} width={1920} height={1080} />
      {/* 3D: render with --gl=angle --concurrency=1 (cosmic-web also --timeout=300000; build its data first: node tools/v18-web.mjs && node tools/v18-zel.mjs) */}
      <Composition id="Style-LightSwarm" component={LightSwarmDemo} durationInFrames={SWARM_DEMO_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Style-CosmicWeb" component={CosmicVideo} durationInFrames={COSMIC_FRAMES} fps={COSMIC_FPS} width={1920} height={1080} />
      <Composition id="Style-CosmicWeb-Look" component={CosmicVideo} durationInFrames={COSMIC_LOOK.length} fps={COSMIC_FPS} width={1920} height={1080} defaultProps={{ stills: true }} />
      {/* 3D on the beat: a split-flap board (countdowns, launches) and a logo written in light (brand intros). For a 4K master register the same component at 3840×2160. */}
      <Composition id="Style-SplitFlap" component={FlapVideo} durationInFrames={FLAP_FRAMES} fps={FLAP_FPS} width={1920} height={1080} />
      <Composition id="Style-SplitFlap-Look" component={FlapVideo} durationInFrames={FLAP_LOOK.length} fps={FLAP_FPS} width={1920} height={1080} defaultProps={{ times: FLAP_LOOK }} />
      <Composition id="Style-LightLogo" component={LightLogoVideo} durationInFrames={LIGHTLOGO_FRAMES} fps={LIGHTLOGO_FPS} width={1920} height={1080} />
      <Composition id="Style-LightLogo-Look" component={LightLogoVideo} durationInFrames={LIGHTLOGO_LOOK.length} fps={LIGHTLOGO_FPS} width={1920} height={1080} defaultProps={{ times: LIGHTLOGO_LOOK }} />
      {/* your videos: <Composition id="V01" component={Video01} durationInFrames={…} fps={30} width={1080} height={1920} /> */}
    </>
  );
};
