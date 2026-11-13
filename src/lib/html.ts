/**
 * Obdelava HTML, izrisanega iz Markdowna (blog, projekti, pravna besedila).
 * Slikam iz /public doda width, height, loading="lazy" in decoding="async",
 * da se postavitev med nalaganjem ne premika.
 */
import { publicImageSize } from '../plugins/image-size.mjs';

export function enhanceHtml(html: string, where: string): string {
  return html.replace(/<img\b([^>]*?)\s*\/?>/g, (tag, attrs: string) => {
    const src = attrs.match(/\ssrc="([^"]+)"/)?.[1] ?? '';
    let extra = '';
    if (src.startsWith('/')) {
      const size = publicImageSize(src);
      if (!size) throw new Error(`${where}: slika ${src} ne obstaja v /public.`);
      if (!/\swidth=/.test(attrs)) extra += ` width="${size.width}"`;
      if (!/\sheight=/.test(attrs)) extra += ` height="${size.height}"`;
    }
    if (!/\sloading=/.test(attrs)) extra += ' loading="lazy"';
    if (!/\sdecoding=/.test(attrs)) extra += ' decoding="async"';
    return `<img${attrs}${extra}>`;
  });
}
