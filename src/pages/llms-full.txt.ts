/** /llms-full.txt: celotna besedila ključnih strani v Markdownu (SPEC, razdelek 7). */
import type { APIRoute } from 'astro';
import { fullText } from '@lib/llms';

export const GET: APIRoute = async () =>
  new Response(await fullText('sl'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
