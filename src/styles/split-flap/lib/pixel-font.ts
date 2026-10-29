// Split-flap · a hand-drawn pixel font for the giant words the board spells with whole flaps (one flap = one pixel).
// Cells are tall (a flap is 2:3), so letters are 9 rows high: digits bold (6 wide, 2-flap strokes), letters thin
// (mostly 4 wide). Gaps: 2 between digits, 1 between letters, 3 between words.

const GLYPH: Record<string, string[]> = {
  "0": [".XXXX.", "XX..XX", "XX..XX", "XX..XX", "XX..XX", "XX..XX", "XX..XX", "XX..XX", ".XXXX."],
  "1": ["..XX..", ".XXX..", "XXXX..", "..XX..", "..XX..", "..XX..", "..XX..", "..XX..", "XXXXXX"],
  "2": [".XXXX.", "XX..XX", "....XX", "...XX.", "..XX..", ".XX...", "XX....", "XX....", "XXXXXX"],
  "3": [".XXXX.", "XX..XX", "....XX", "....XX", "..XXX.", "....XX", "....XX", "XX..XX", ".XXXX."],
  "4": ["....XX", "...XXX", "..X.XX", ".X..XX", "X...XX", "XXXXXX", "....XX", "....XX", "....XX"],
  "5": ["XXXXXX", "XX....", "XX....", "XXXXX.", "....XX", "....XX", "....XX", "XX..XX", ".XXXX."],
  "6": [".XXXX.", "XX..XX", "XX....", "XXXXX.", "XX..XX", "XX..XX", "XX..XX", "XX..XX", ".XXXX."],
  "7": ["XXXXXX", "....XX", "....XX", "...XX.", "...XX.", "..XX..", "..XX..", "..XX..", "..XX.."],
  "8": [".XXXX.", "XX..XX", "XX..XX", "XX..XX", ".XXXX.", "XX..XX", "XX..XX", "XX..XX", ".XXXX."],
  "9": [".XXXX.", "XX..XX", "XX..XX", "XX..XX", ".XXXXX", "....XX", "....XX", "XX..XX", ".XXXX."],
  ":": ["..", "..", "XX", "XX", "..", "XX", "XX", "..", ".."],
  "-": ["...", "...", "...", "...", "XXX", "...", "...", "...", "..."],
  "!": ["X", "X", "X", "X", "X", "X", ".", ".", "X"],
  A: [".XX.", "X..X", "X..X", "X..X", "XXXX", "X..X", "X..X", "X..X", "X..X"],
  B: ["XXX.", "X..X", "X..X", "X..X", "XXX.", "X..X", "X..X", "X..X", "XXX."],
  C: [".XXX", "X...", "X...", "X...", "X...", "X...", "X...", "X...", ".XXX"],
  D: ["XXX.", "X..X", "X..X", "X..X", "X..X", "X..X", "X..X", "X..X", "XXX."],
  E: ["XXXX", "X...", "X...", "X...", "XXX.", "X...", "X...", "X...", "XXXX"],
  F: ["XXXX", "X...", "X...", "X...", "XXX.", "X...", "X...", "X...", "X..."],
  G: [".XXX", "X...", "X...", "X...", "X.XX", "X..X", "X..X", "X..X", ".XXX"],
  H: ["X..X", "X..X", "X..X", "X..X", "XXXX", "X..X", "X..X", "X..X", "X..X"],
  I: ["XXX", ".X.", ".X.", ".X.", ".X.", ".X.", ".X.", ".X.", "XXX"],
  J: ["..XX", "...X", "...X", "...X", "...X", "...X", "...X", "X..X", ".XX."],
  K: ["X..X", "X..X", "X.X.", "X.X.", "XX..", "X.X.", "X.X.", "X..X", "X..X"],
  L: ["X...", "X...", "X...", "X...", "X...", "X...", "X...", "X...", "XXXX"],
  M: ["X...X", "XX.XX", "X.X.X", "X.X.X", "X...X", "X...X", "X...X", "X...X", "X...X"],
  N: ["X...X", "XX..X", "XX..X", "X.X.X", "X.X.X", "X..XX", "X..XX", "X...X", "X...X"],
  O: [".XX.", "X..X", "X..X", "X..X", "X..X", "X..X", "X..X", "X..X", ".XX."],
  P: ["XXX.", "X..X", "X..X", "X..X", "XXX.", "X...", "X...", "X...", "X..."],
  Q: [".XX.", "X..X", "X..X", "X..X", "X..X", "X..X", "X.X.", "X..X", ".X.X"],
  R: ["XXX.", "X..X", "X..X", "X..X", "XXX.", "X.X.", "X..X", "X..X", "X..X"],
  S: [".XXX", "X...", "X...", "X...", ".XX.", "...X", "...X", "...X", "XXX."],
  T: ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "..X..", "..X..", "..X.."],
  U: ["X..X", "X..X", "X..X", "X..X", "X..X", "X..X", "X..X", "X..X", ".XX."],
  V: ["X...X", "X...X", "X...X", "X...X", ".X.X.", ".X.X.", ".X.X.", "..X..", "..X.."],
  W: ["X...X", "X...X", "X...X", "X...X", "X.X.X", "X.X.X", "X.X.X", "XX.XX", "X...X"],
  X: ["X...X", "X...X", ".X.X.", ".X.X.", "..X..", ".X.X.", ".X.X.", "X...X", "X...X"],
  Y: ["X...X", "X...X", ".X.X.", ".X.X.", "..X..", "..X..", "..X..", "..X..", "..X.."],
  Z: ["XXXX", "...X", "...X", "..X.", ".X..", ".X..", "X...", "X...", "XXXX"],
};
export const PIXEL_ROWS = 9;
const isDigit = (c: string) => c >= "0" && c <= "9";
/** how many flap columns a line of words takes */
export function pixelWidth(words: string[]) {
  let w = 0;
  words.forEach((word, wi) => {
    const chars = word.toUpperCase().split("");
    chars.forEach((ch, i) => {
      w += (GLYPH[ch] ?? GLYPH["-"])[0].length;
      if (i + 1 < chars.length) w += isDigit(ch) && isDigit(chars[i + 1]) ? 2 : 1;
    });
    if (wi + 1 < words.length) w += 3;
  });
  return w;
}
/**
 * A field of `rows` × `cols` flaps with words drawn in pixels, centred across, letters on rows top..top+8.
 * words = [[text, group], …] — every lit flap gets its word's group number (0 = off), so a program can colour
 * groups differently (e.g. group 1 turns red on the drop). Unknown characters draw as «-».
 */
export function pixelText(words: [string, number][], cols: number, rows = 11, top = 1) {
  const out: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const total = pixelWidth(words.map(([w]) => w));
  if (total > cols) throw new Error(`pixel text is ${total} flaps wide, the board has ${cols} columns — shorten it or add columns`);
  let x = Math.floor((cols - total) / 2);
  words.forEach(([word, grp], wi) => {
    const chars = word.toUpperCase().split("");
    chars.forEach((ch, i) => {
      const g = GLYPH[ch] ?? GLYPH["-"];
      g.forEach((row, y) => row.split("").forEach((p, dx) => { if (p === "X" && top + y < rows) out[top + y][x + dx] = grp; }));
      x += g[0].length;
      if (i + 1 < chars.length) x += isDigit(ch) && isDigit(chars[i + 1]) ? 2 : 1;
    });
    if (wi + 1 < words.length) x += 3;
  });
  return out;
}
