/**
 * Dimenzije slik iz /public brez dodatnih knjižnic (PNG, JPEG, GIF, WebP, SVG).
 * Uporabljata jih predloge (naslovnice) in rehype vtičnik za slike v Markdownu.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const cache = new Map();

/** @param {string} publicPath npr. "/images/blog/x/naslovna.webp" @returns {{width:number,height:number}|null} */
export function publicImageSize(publicPath) {
  if (cache.has(publicPath)) return cache.get(publicPath);
  const file = join(process.cwd(), 'public', decodeURI(publicPath));
  const size = existsSync(file) ? sizeOf(readFileSync(file)) : null;
  cache.set(publicPath, size);
  return size;
}

/** @param {Buffer} b */
function sizeOf(b) {
  // PNG
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  // GIF
  if (b.toString('ascii', 0, 3) === 'GIF') return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  // WebP
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (chunk === 'VP8L') {
      const v = b.readUInt32LE(21);
      return { width: (v & 0x3fff) + 1, height: ((v >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  // JPEG
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
      i += 2 + len;
    }
  }
  // SVG
  const head = b.toString('utf8', 0, 512);
  const vb = head.match(/viewBox="[\d.\s-]*?\s([\d.]+)\s([\d.]+)"/);
  if (vb) return { width: Math.round(+vb[1]), height: Math.round(+vb[2]) };
  return null;
}
