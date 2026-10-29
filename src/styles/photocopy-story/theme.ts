// Photocopy Story — a narrated product story where everything is a PRINT: UI screens, notifications, calendars,
// invoices and newspapers photocopied on grainy paper, pinned on a dark desk, annotated with red marker. A camera
// drifts across the sheets; typewriter subtitles type word by word. Horizontal 1920×1080. Ref: Ferndesk launch video.
import { continueRender, delayRender, staticFile } from "remotion";
export * from "../../lib/util";

export const V = { W: 1920, H: 1080 };

export const P = {
  ink: "#2a2724",
  ink2: "#5d5953",
  faint: "#a19b92",
  line: "rgba(42,39,36,.14)",
  red: "#c8352b",
  redInk: "rgba(200,40,32,.92)",
  paper: "#e9e5dd",
  box: "rgba(238,234,226,.94)",
  desk: "#1d1d1d",
};

/** Fonts: VazirUI (Vazirmatn), VazirCode (typewriter subtitles), Naskh (giant serif numbers/headlines), Nastaliq (masthead). */
export const PF = { ui: "VazirUI", code: "VazirCode", naskh: "Naskh", nast: "Nastaliq", mono: "'Courier New', monospace" };
const FILES: [string, string, string?][] = [
  [PF.ui, "Vazirmatn-Regular.ttf", "400"], [PF.ui, "Vazirmatn-SemiBold.ttf", "600"], [PF.ui, "Vazirmatn-Bold.ttf", "700"], [PF.ui, "Vazirmatn-Black.ttf", "900"],
  [PF.code, "VazirCode.ttf"], [PF.naskh, "NotoNaskhArabic.ttf", "400 700"], [PF.nast, "NotoNastaliqUrdu.ttf", "400 700"],
];
const handle = delayRender("photocopy fonts");
Promise.all(FILES.map(([fam, file, weight]) => new FontFace(fam, `url('${staticFile("fonts/" + file)}') format('truetype')`, weight ? { weight } : {}).load().then((f) => document.fonts.add(f))))
  .then(() => continueRender(handle))
  .catch((e) => { console.error("font load", e); continueRender(handle); });

/** Paper/desk textures — owned by the style (public/styles/photocopy-story/), so any video can use them. */
export const TEX = { paper: "styles/photocopy-story/paper.jpg", desk: "styles/photocopy-story/desk.jpg" };
