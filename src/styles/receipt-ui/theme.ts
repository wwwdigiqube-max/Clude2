// Receipt UI — word-synced captions + realistic product UI + a receipt that keeps printing. Vertical 1080×1920.
export * from "../../lib/util";

export type Mode = "light" | "dark";

export const T = {
  light: { bg: "#f2f2f3", grid: "rgba(0,0,0,.035)", card: "#ffffff", cardLine: "rgba(0,0,0,.08)", text: "#111114", sub: "#8d8d94", faint: "#c9c9cf", field: "#f3f3f5", shadow: "0 30px 70px rgba(0,0,0,.10), 0 6px 18px rgba(0,0,0,.06)" },
  dark: { bg: "#0e0e10", grid: "rgba(255,255,255,.035)", card: "#1a1a1e", cardLine: "rgba(255,255,255,.08)", text: "#f4f4f6", sub: "#76767e", faint: "#3a3a40", field: "#242429", shadow: "0 30px 70px rgba(0,0,0,.55), 0 6px 18px rgba(0,0,0,.35)" },
};

export const C = {
  blue: "#2f6bff",
  blueSoft: "rgba(47,107,255,.16)",
  red: "#e5484d",
  redSoft: "rgba(229,72,77,.12)",
  green: "#2fb36b",
  violet: "#635bff", // stripe
  paper: "#f7f3ea",
  ink: "#1d1b18",
};

export const FONT_UI = "'Segoe UI', 'Segoe UI Variable', Arial, sans-serif";
export const V = { W: 1080, H: 1920 };
