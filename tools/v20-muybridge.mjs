// Video 20: white-on-transparent human silhouettes from two public-domain Muybridge plates (Animal Locomotion, 1887,
// Wikimedia Commons). Each frame is cropped from the plate, thresholded softly (the figure is lighter than the dark
// striped backdrop), cleaned and saved as a white PNG with alpha.  Usage: node tools/v20-muybridge.mjs [plates dir/] [out dir/]  (kit: … public/styles/test-reel/muy/)
import { execFileSync } from "node:child_process";
import fs from "node:fs";

// plates: download the two Wikimedia Commons files (links in the CREDITS line below) into <plates dir>
const SRC = process.argv[2] ?? "../videos/20-nfp-showreel/muybridge/";
const OUT = process.argv[3] ?? "public/v20/muy/";
fs.mkdirSync(OUT, { recursive: true });
const jobs = [];
// plate 60 — running (two rows of five, lateral view)
for (let row = 0; row < 2; row++)
  for (let k = 0; k < 5; k++)
    jobs.push({ src: "run060.jpg", name: `run${row * 5 + k}`, x: Math.round(976 + k * 378.6), y: row ? 1190 : 730, w: 360, h: row ? 336 : 346, lo: 132, hi: 176 });
// plate 159 — running long jump (one row of twelve)
for (let k = 0; k < 12; k++) jobs.push({ src: "jump159.jpg", name: `jump${k}`, x: Math.round(565 + k * 227.2), y: 1056, w: 208, h: 280, lo: 166, hi: 204 });
for (const j of jobs) {
  // soft threshold: below lo → 0, above hi → 255; a 1px median removes the backdrop's thin light stripes
  const lut = `lutyuv=y='clip((val-${j.lo})*255/(${j.hi}-${j.lo}),0,255)'`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", SRC + j.src, "-filter_complex",
    `[0]crop=${j.w}:${j.h}:${j.x}:${j.y},format=gray,median=radius=2,${lut},gblur=sigma=0.6,geq=lum='p(X,Y)*min(1,min(min(X,W-X),min(Y,H-Y))/14)'[m];color=white:s=${j.w}x${j.h}[c];[c][m]alphamerge,format=rgba[o]`,
    "-map", "[o]", "-frames:v", "1", OUT + j.name + ".png"]);
}
fs.writeFileSync(OUT + "CREDITS.md", "Eadweard Muybridge, Animal Locomotion (1887), plates 60 and 159 — Public domain — Wikimedia Commons:\n" +
  "- https://commons.wikimedia.org/wiki/File:Man_in_pelvis_cloth_running_at_a_half-mile_gait_(rbm-QP301M8-1887-060).jpg\n" +
  "- https://commons.wikimedia.org/wiki/File:Man_in_pelvis_cloth_running_and_jumping_(rbm-QP301M8-1887-159).jpg\n");
console.log("silhouettes:", jobs.length);
