/**
 * make-og.mjs — composes the social share image (public/og.png, 1200×630) from
 * the climax still: the cap's neon reveal, darkened, with the wordmark set over
 * it. Run after regenerating frames if the climax changes.
 */
import sharp from "sharp";
import path from "node:path";

const root = process.cwd();
const W = 1200;
const H = 630;

const overlay = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#060607" stop-opacity="0.96"/>
      <stop offset="0.55" stop-color="#060607" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#060607" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="86" cy="452" r="7" fill="#ff5412"/>
  <text x="108" y="462" font-family="Helvetica, Arial, sans-serif" font-size="22"
        letter-spacing="6" fill="#8b8a85">THE REVEAL</text>
  <text x="80" y="556" font-family="Helvetica, Arial, sans-serif" font-weight="700"
        font-size="120" letter-spacing="-5" fill="#ece9e2">BRAND</text>
</svg>`);

await sharp(path.resolve(root, "public/stills/climax.webp"))
  .resize(W, H, { fit: "cover", position: "centre" })
  .composite([{ input: overlay }])
  .png()
  .toFile(path.resolve(root, "public/og.png"));

console.log("✓ public/og.png");
