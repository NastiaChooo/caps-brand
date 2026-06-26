/**
 * extract-frames.mjs
 * -----------------------------------------------------------------------------
 * Turns a source rotation video into the scroll-scrubbed image sequence used by
 * the hero (`<ScrollSequence>`). This is the "Apple AirPods page" technique:
 * we never scrub a <video> element (seeking stutters on keyframe boundaries,
 * worst on Safari/iOS). Instead we draw a pre-decoded still onto a <canvas> for
 * each scroll position — which is what guarantees a locked 60fps.
 *
 * Pipeline:  ffmpeg (decode + trim + scale → PNG)  →  sharp (PNG → WebP)
 *
 * The output is intentionally self-describing: a `manifest.json` carries the
 * frame count and dimensions, so swapping in the real brand footage is a
 * one-command operation with zero code changes:
 *
 *     node scripts/extract-frames.mjs --src assets/source/<new>.mp4 --start <s> --end <s>
 *
 * Requires `ffmpeg` on PATH. `sharp` is a devDependency.
 */

import { execFile } from "node:child_process";
import { mkdir, rm, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const exec = promisify(execFile);
const root = process.cwd();

// ---- Configuration (overridable via CLI flags) ------------------------------
const args = parseArgs(process.argv.slice(2));
const cfg = {
  src: args.src ?? "assets/source/cap-rotation.mp4",
  // Trim window: skips the AI title card, starts as the cap emerges from the
  // shadow, ends on the neon-underbrim climax. Tuned to the provided footage.
  start: num(args.start, 1.1),
  end: num(args.end, 8.04),
  width: num(args.width, 1280), // dark frames compress hard; 1280 is plenty
  quality: num(args.quality, 86), // WebP q — high enough to avoid dark banding
  outDir: args.out ?? "public/sequence",
  posterDir: args.posterDir ?? "public/stills",
  // Optional per-channel level offset, e.g. --sub 4 or --sub 4,3,4. Lets a clip
  // with a near-black studio backdrop be nudged onto the site's exact void
  // colour so the frame dissolves into the page with no tonal seam.
  sub: parseSub(args.sub),
};

function parseSub(v) {
  if (!v || v === true) return null;
  const parts = String(v).split(",").map(Number);
  if (parts.some((n) => !Number.isFinite(n))) return null;
  return parts.length === 1 ? [-parts[0], -parts[0], -parts[0]] : parts.map((n) => -n);
}

async function main() {
  const srcPath = path.resolve(root, cfg.src);
  if (!existsSync(srcPath)) {
    throw new Error(`Source video not found: ${cfg.src}`);
  }

  const outDir = path.resolve(root, cfg.outDir);
  const posterDir = path.resolve(root, cfg.posterDir);
  const tmpDir = path.join(os.tmpdir(), `caps-frames-${Date.now()}`);

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await mkdir(posterDir, { recursive: true });
  await mkdir(tmpDir, { recursive: true });

  const duration = (cfg.end - cfg.start).toFixed(3);
  console.log(
    `→ ffmpeg: ${cfg.src} [${cfg.start}s → ${cfg.end}s] @ ${cfg.width}px`
  );

  // 1. Decode + trim + scale to lossless PNGs in a temp dir.
  await exec("ffmpeg", [
    "-y",
    "-loglevel", "error",
    "-ss", String(cfg.start),
    "-t", duration,
    "-i", srcPath,
    "-vf", `scale=${cfg.width}:-2:flags=lanczos`,
    path.join(tmpDir, "src_%04d.png"),
  ]);

  const pngs = (await readdir(tmpDir))
    .filter((f) => f.endsWith(".png"))
    .sort();
  if (pngs.length === 0) throw new Error("ffmpeg produced no frames");

  // 2. PNG → WebP via sharp, renumbered from 0001. effort:6 = max compression.
  console.log(`→ sharp: encoding ${pngs.length} frames to WebP q${cfg.quality}`);
  let height = 0;
  let totalBytes = 0;
  const pad = String(pngs.length).length < 4 ? 4 : String(pngs.length).length;

  for (let i = 0; i < pngs.length; i++) {
    const index = String(i + 1).padStart(pad, "0");
    const dest = path.join(outDir, `frame_${index}.webp`);
    let pipe = sharp(path.join(tmpDir, pngs[i]));
    if (cfg.sub) pipe = pipe.linear([1, 1, 1], cfg.sub);
    const out = await pipe
      .webp({ quality: cfg.quality, effort: 6, smartSubsample: true })
      .toFile(dest);
    if (!height) height = out.height;
    totalBytes += out.size;
  }

  // 3. Poster / reduced-motion still = the climax frame, at full quality.
  const climax = path.join(tmpDir, pngs[pngs.length - 1]);
  await sharp(climax)
    .webp({ quality: 92, effort: 6 })
    .toFile(path.join(posterDir, "climax.webp"));
  // First frame doubles as the LCP poster behind the wordmark.
  await sharp(path.join(tmpDir, pngs[0]))
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(posterDir, "emerge.webp"));

  // 4. Self-describing manifest — the single source of truth the UI reads.
  // basePath is derived from the output folder so the manifest is portable:
  // point --out anywhere under public/ and the URLs stay correct.
  const publicDir = path.resolve(root, "public");
  const basePath =
    "/" + path.relative(publicDir, outDir).split(path.sep).join("/");
  const manifest = {
    basePath,
    prefix: "frame_",
    ext: "webp",
    pad,
    frames: pngs.length,
    width: cfg.width,
    height,
    fps: 24,
    source: path.basename(cfg.src),
    generatedAt: new Date().toISOString(),
  };
  await writeFile(
    path.join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n"
  );

  await rm(tmpDir, { recursive: true, force: true });

  const mb = (totalBytes / 1024 / 1024).toFixed(2);
  const avg = Math.round(totalBytes / pngs.length / 1024);
  console.log(
    `✓ ${pngs.length} frames · ${cfg.width}×${height} · ${mb} MB total · ~${avg} KB/frame`
  );
  console.log(`✓ manifest → ${cfg.outDir}/manifest.json`);
}

// ---- tiny arg helpers -------------------------------------------------------
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const val = argv[i + 1]?.startsWith("--") ? true : argv[++i];
      out[key] = val ?? true;
    }
  }
  return out;
}
function num(v, d) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
