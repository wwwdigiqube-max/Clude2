// Image plates (photos the user generated, public-domain plates). Loaded once before the first frame; a missing file
// leaves null so a scene can fall back to drawing.
const imgs = new Map<string, HTMLImageElement | null>();
export function loadImages(url: (f: string) => string, files: Record<string, string>) {
  return Promise.all(
    Object.entries(files).map(
      ([name, file]) =>
        new Promise<void>((done) => {
          const im = new Image();
          im.onload = () => {
            imgs.set(name, im);
            done();
          };
          im.onerror = () => {
            imgs.set(name, null);
            done();
          };
          im.src = url(file);
        }),
    ),
  );
}
export const img = (name: string) => imgs.get(name) ?? null;
