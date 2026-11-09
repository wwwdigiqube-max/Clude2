// Art Motion · React wrappers: a <canvas> that the engine draws into at the current time.
//   <ArtFilmCanvas segs={…}/>  art scenes + signature transitions (1920×1080 stage)
//   <ClipCanvas spec={…}/>     an explainer grammar driven by a JSON spec (any size, portrait included)
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cancelRender, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { makeFilm, prepareFilm, type Seg } from "./film";
import { makeClip, prepareClip, type ClipSpec } from "./clip";

const useOnceReady = (label: string) => {
  const [handle] = useState(() => delayRender(label, { timeoutInMilliseconds: 120000 }));
  const done = useRef(false);
  return () => {
    if (!done.current) {
      done.current = true;
      continueRender(handle);
    }
  };
};

type FilmProps = { segs: Seg[]; t?: number; width?: number; height?: number; style?: React.CSSProperties; punch?: number; dpr?: number };
/** a new film (other segs / size) remounts the canvas, so the frame waits for it instead of drawing the old one */
export const ArtFilmCanvas: React.FC<FilmProps> = (p) => <FilmCanvas key={`${JSON.stringify(p.segs)}|${p.width}|${p.height}|${p.dpr}|${p.punch}`} {...p} />;
const FilmCanvas: React.FC<FilmProps> = ({
  segs,
  t: tIn,
  width = 1920,
  height = 1080,
  style,
  punch,
  dpr = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = tIn ?? frame / fps;
  const ref = useRef<HTMLCanvasElement>(null);
  const [film, setFilm] = useState<ReturnType<typeof makeFilm> | null>(null);
  const ready = useOnceReady("art-motion film");
  const key = JSON.stringify(segs);
  useEffect(() => {
    let alive = true;
    prepareFilm(segs, width, height)
      .then(() => alive && setFilm(makeFilm(segs, width, height, { punch, dpr })))
      .catch((e) => cancelRender(e));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, width, height, punch, dpr]);
  useLayoutEffect(() => {
    if (!film || !ref.current) return;
    film.render(ref.current.getContext("2d") as CanvasRenderingContext2D, t);
    ready();
  }, [film, t, ready]);
  return <canvas ref={ref} width={Math.round(width * dpr)} height={Math.round(height * dpr)} style={{ display: "block", width: "100%", height: "100%", ...style }} />;
};

type ClipProps = { spec: ClipSpec; t?: number; style?: React.CSSProperties };
export const ClipCanvas: React.FC<ClipProps> = (p) => <ClipCanvasInner key={JSON.stringify(p.spec)} {...p} />;
const ClipCanvasInner: React.FC<ClipProps> = ({ spec, t: tIn, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = tIn ?? frame / fps;
  const ref = useRef<HTMLCanvasElement>(null);
  const [clip, setClip] = useState<ReturnType<typeof makeClip> | null>(null);
  const ready = useOnceReady("art-motion clip");
  const key = JSON.stringify(spec);
  const W = spec.width ?? 1920, H = spec.height ?? 1080;
  useEffect(() => {
    let alive = true;
    prepareClip(spec)
      .then((img) => alive && setClip(makeClip(spec, img)))
      .catch((e) => cancelRender(e));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useLayoutEffect(() => {
    if (!clip || !ref.current) return;
    clip.render(ref.current.getContext("2d") as CanvasRenderingContext2D, Math.min(t, spec.duration));
    ready();
  }, [clip, t, ready, spec.duration]);
  return <canvas ref={ref} width={W} height={H} style={{ display: "block", width: "100%", height: "100%", ...style }} />;
};
