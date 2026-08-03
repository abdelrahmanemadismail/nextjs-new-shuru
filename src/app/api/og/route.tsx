import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createCanvas, GlobalFonts, loadImage, Canvas, SKRSContext2D } from '@napi-rs/canvas';
import { type Locale } from '@/lib/i18n';
import { extractMediaUrl, toAbsoluteUrl } from '@/lib/strapi';
import { fixArabicText, sanitizeTextForOg } from '@/lib/arabic';
import { getHeaderSettings } from '@/strapi/header';
import { getHomeCached } from '@/strapi/home';
import { getPageCached } from '@/strapi/page';
import {
  getArticleBySlugCached,
  getNewsItemBySlugCached,
  getPodcastBySlugCached,
  getMagazineIssueBySlugCached,
  getMajlisBySlugCached,
} from '@/strapi/insights';

export const runtime = 'nodejs';

// Font registration flag
let fontsRegistered = false;

function ensureFontsRegistered() {
  if (fontsRegistered) return;
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  const tajawalReg = path.join(fontsDir, 'Tajawal-Regular.ttf');
  const tajawalBold = path.join(fontsDir, 'Tajawal-Bold.ttf');
  const interReg = path.join(fontsDir, 'Inter-Regular.ttf');
  const interBold = path.join(fontsDir, 'Inter-Bold.ttf');

  if (fs.existsSync(tajawalReg)) {
    GlobalFonts.registerFromPath(tajawalReg, 'Tajawal');
  }
  if (fs.existsSync(tajawalBold)) {
    GlobalFonts.registerFromPath(tajawalBold, 'TajawalBold');
  }
  if (fs.existsSync(interReg)) {
    GlobalFonts.registerFromPath(interReg, 'Inter');
  }
  if (fs.existsSync(interBold)) {
    GlobalFonts.registerFromPath(interBold, 'InterBold');
  }

  fontsRegistered = true;
}

async function fetchImageAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error('Failed to fetch image buffer for OG generation:', url, err);
    return null;
  }
}

async function fetchRawImageResponse(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('Failed to fetch raw cover image from Strapi:', url, err);
    return null;
  }
}

function drawRoundedRect(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  }
  ctx.closePath();
}

function wrapText(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 3
): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;

      if (lines.length === maxLines - 1) {
        const remaining = words.slice(i).join(' ');
        let lastLine = remaining;
        while (ctx.measureText(lastLine + '...').width > maxWidth && lastLine.length > 0) {
          lastLine = lastLine.substring(0, lastLine.length - 1);
        }
        lines.push(lastLine ? `${lastLine.trim()}...` : '...');
        return lines;
      }
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'insight';
    const slug = searchParams.get('slug') || '';
    const locale = (searchParams.get('locale') || 'ar') as Locale;
    const isAr = locale === 'ar';

    let title = searchParams.get('title') || '';
    let description = searchParams.get('description') || '';
    let cta1 = searchParams.get('cta1') || '';
    let cta2 = searchParams.get('cta2') || '';
    let category = searchParams.get('category') || '';
    let customLogoUrl = searchParams.get('logoUrl');
    let rawCoverUrl: string | null = null;

    // 1. Fetch data from Strapi based on type and slug
    if (type === 'hero') {
      try {
        const homeData = await getHomeCached(locale);
        const heroBlock = homeData?.blocks?.find(
          (b): b is import('@/strapi/home').StrapiHeroBlock => b.__component === 'home.hero'
        );
        if (heroBlock) {
          if (!title) title = heroBlock.title;
          if (!description) description = heroBlock.subtitle || '';
          if (!cta1) cta1 = heroBlock.primaryCtaText;
          if (!cta2) cta2 = heroBlock.secondaryCtaText || '';
        }
      } catch (e) {
        console.error('Failed to fetch hero data from Strapi:', e);
      }
    } else if (slug) {
      try {
        if (type === 'article') {
          const article = await getArticleBySlugCached(slug, locale);
          if (article) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(article.cover_image) || extractMediaUrl(article.seo?.og_image));
            if (!title) title = article.seo?.meta_title || article.title;
            if (!description) description = article.seo?.meta_description || article.description || '';
            if (!category && article.categories && article.categories.length > 0) {
              category = article.categories[0].name;
            }
          }
        } else if (type === 'news') {
          const news = await getNewsItemBySlugCached(slug, locale);
          if (news) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(news.cover_image) || extractMediaUrl(news.seo?.og_image));
            if (!title) title = news.seo?.meta_title || news.title;
            if (!description) description = news.seo?.meta_description || news.description || '';
          }
        } else if (type === 'podcast') {
          const podcast = await getPodcastBySlugCached(slug, locale);
          if (podcast) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(podcast.cover_image) || extractMediaUrl(podcast.seo?.og_image));
            if (!title) title = podcast.seo?.meta_title || podcast.title;
            if (!description) description = podcast.seo?.meta_description || podcast.description || '';
          }
        } else if (type === 'magazine') {
          const issue = await getMagazineIssueBySlugCached(slug, locale);
          if (issue) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(issue.cover_image) || extractMediaUrl(issue.seo?.og_image));
            if (!title) title = issue.seo?.meta_title || issue.title;
            if (!description) description = issue.seo?.meta_description || issue.description || '';
          }
        } else if (type === 'majlis') {
          const majlis = await getMajlisBySlugCached(slug, locale);
          if (majlis) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(majlis.cover_image) || extractMediaUrl(majlis.seo?.og_image));
            if (!title) title = majlis.seo?.meta_title || majlis.title;
            if (!description) description = majlis.seo?.meta_description || majlis.description || '';
          }
        } else if (type === 'page') {
          const page = await getPageCached(slug, locale);
          if (page) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(page.seo?.og_image));
            if (!title) title = page.seo?.meta_title || page.title;
            if (!description) description = page.seo?.meta_description || '';
          }
        }
      } catch (err) {
        console.error(`Failed to fetch Strapi entity (${type}/${slug}):`, err);
      }
    }

    // 2. If Strapi returned a raw cover image, stream it directly
    if (rawCoverUrl) {
      const rawResponse = await fetchRawImageResponse(rawCoverUrl);
      if (rawResponse) return rawResponse;
    }

    // Fallback default title if still missing
    if (!title) {
      title = isAr ? 'شروع – رحلة نحو التميز' : 'SHURU – The journey toward excellence';
    }

    // Sanitize text strings for rendering
    const displayTitle = isAr ? fixArabicText(title) : sanitizeTextForOg(title);
    const displayDescription = isAr ? fixArabicText(description) : sanitizeTextForOg(description);
    const displayCategory = isAr ? fixArabicText(category) : sanitizeTextForOg(category);
    const displayCta1 = isAr ? fixArabicText(cta1) : sanitizeTextForOg(cta1);
    const displayCta2 = isAr ? fixArabicText(cta2) : sanitizeTextForOg(cta2);

    // 3. Register fonts with Skia/HarfBuzz
    ensureFontsRegistered();

    // 4. Resolve logo image buffer
    let logoBuffer: Buffer | null = null;
    if (customLogoUrl) {
      logoBuffer = await fetchImageAsBuffer(customLogoUrl);
    }

    if (!logoBuffer) {
      try {
        const headerSettings = await getHeaderSettings(locale);
        const strapiLogo = headerSettings?.darkLogoUrl || headerSettings?.lightLogoUrl;
        if (strapiLogo) {
          logoBuffer = await fetchImageAsBuffer(strapiLogo);
        }
      } catch (e) {
        console.error('Failed to load header logo from Strapi:', e);
      }
    }

    if (!logoBuffer) {
      try {
        const logoPath = path.join(process.cwd(), 'public', 'شعار بدون خلفية-04.png');
        if (fs.existsSync(logoPath)) {
          logoBuffer = fs.readFileSync(logoPath);
        }
      } catch (e) {
        console.error('Failed to load local brand logo:', e);
      }
    }

    // 5. Create Canvas (1200 x 630)
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    const primaryFont = isAr ? 'Tajawal, sans-serif' : 'Inter, sans-serif';
    const boldFont = isAr ? 'TajawalBold, Tajawal, sans-serif' : 'InterBold, Inter, sans-serif';

    // HERO CARD RENDER
    if (type === 'hero') {
      // Fill Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1200, 630);

      // Soft Ambient Radial Glow
      const glowX = isAr ? 1200 : 0;
      const glowY = 0;
      const gradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 500);
      gradient.addColorStop(0, 'rgba(20, 184, 166, 0.14)');
      gradient.addColorStop(0.7, 'rgba(20, 184, 166, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(glowX, glowY, 500, 0, Math.PI * 2);
      ctx.fill();

      // Header Logo
      let logoLoadedImage = null;
      if (logoBuffer) {
        try {
          logoLoadedImage = await loadImage(logoBuffer);
        } catch (e) {
          console.error('Failed to parse logo image buffer for canvas:', e);
        }
      }

      const topY = 60;
      const marginX = 80;

      if (logoLoadedImage) {
        const logoHeight = 56;
        const aspect = logoLoadedImage.width / logoLoadedImage.height;
        const logoWidth = logoHeight * aspect;
        const logoX = isAr ? 1200 - marginX - logoWidth : marginX;
        ctx.drawImage(logoLoadedImage, logoX, topY, logoWidth, logoHeight);
      } else {
        ctx.font = `bold 28px ${boldFont}`;
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = isAr ? 'right' : 'left';
        ctx.fillText(isAr ? 'شروع SHURU' : 'SHURU', isAr ? 1200 - marginX : marginX, topY + 36);
      }

      // Title & Description
      const contentMaxW = 960;
      ctx.textAlign = isAr ? 'right' : 'left';

      ctx.font = `bold 48px ${boldFont}`;
      const titleLines = wrapText(ctx, displayTitle, contentMaxW, 2);

      ctx.font = `400 20px ${primaryFont}`;
      const descLines = displayDescription ? wrapText(ctx, displayDescription, contentMaxW, 2) : [];

      // Vertical positioning calculation
      const titleLineHeight = 60;
      const descLineHeight = 30;
      const ctaHeight = (displayCta1 || displayCta2) ? 50 : 0;
      const contentBlockHeight =
        titleLines.length * titleLineHeight +
        (descLines.length > 0 ? descLines.length * descLineHeight + 20 : 0) +
        (ctaHeight > 0 ? ctaHeight + 30 : 0);

      const startY = 160 + Math.max(0, (350 - contentBlockHeight) / 2);
      const textX = isAr ? 1200 - marginX : marginX;

      let currentY = startY;

      // Draw Title
      ctx.font = `bold 48px ${boldFont}`;
      ctx.fillStyle = '#0f172a';
      for (const line of titleLines) {
        ctx.fillText(line, textX, currentY);
        currentY += titleLineHeight;
      }

      // Draw Description
      if (descLines.length > 0) {
        currentY += 8;
        ctx.font = `400 20px ${primaryFont}`;
        ctx.fillStyle = '#475569';
        for (const line of descLines) {
          ctx.fillText(line, textX, currentY);
          currentY += descLineHeight;
        }
      }

      // Draw CTAs
      if (displayCta1 || displayCta2) {
        currentY += 20;
        let buttonX = isAr ? 1200 - marginX : marginX;

        if (displayCta1) {
          ctx.font = `bold 18px ${boldFont}`;
          const cta1Metrics = ctx.measureText(displayCta1);
          const btnW = cta1Metrics.width + 64;
          const btnH = 48;
          const rectX = isAr ? buttonX - btnW : buttonX;

          ctx.fillStyle = '#0d9488';
          drawRoundedRect(ctx, rectX, currentY, btnW, btnH, 24);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(displayCta1, rectX + btnW / 2, currentY + 30);

          if (isAr) {
            buttonX -= btnW + 16;
          } else {
            buttonX += btnW + 16;
          }
        }

        if (displayCta2) {
          ctx.font = `bold 18px ${boldFont}`;
          const cta2Metrics = ctx.measureText(displayCta2);
          const btnW = cta2Metrics.width + 60;
          const btnH = 48;
          const rectX = isAr ? buttonX - btnW : buttonX;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          drawRoundedRect(ctx, rectX, currentY, btnW, btnH, 24);
          ctx.fill();

          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          drawRoundedRect(ctx, rectX, currentY, btnW, btnH, 24);
          ctx.stroke();

          ctx.fillStyle = '#334155';
          ctx.textAlign = 'center';
          ctx.fillText(displayCta2, rectX + btnW / 2, currentY + 30);
        }
      }

      // Footer
      const footerY = 570;
      const barW = 16;
      const barH = 2;

      ctx.fillStyle = '#0d9488';
      if (isAr) {
        ctx.fillRect(1200 - marginX - barW, footerY - 10, barW, barH);
        ctx.font = `bold 18px ${boldFont}`;
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'right';
        ctx.fillText('shuru.sa', 1200 - marginX - barW - 12, footerY);
      } else {
        ctx.fillRect(marginX, footerY - 10, barW, barH);
        ctx.font = `bold 18px ${boldFont}`;
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'left';
        ctx.fillText('shuru.sa', marginX + barW + 12, footerY);
      }
    } else {
      // INSIGHT / ARTICLE / DEFAULT CARD RENDER
      ctx.fillStyle = '#f6f6f6';
      ctx.fillRect(0, 0, 1200, 630);

      // Header Logo
      let logoLoadedImage = null;
      if (logoBuffer) {
        try {
          logoLoadedImage = await loadImage(logoBuffer);
        } catch (e) {
          console.error('Failed to parse logo image buffer for canvas:', e);
        }
      }

      const topY = 60;
      const marginX = 80;

      if (logoLoadedImage) {
        const logoHeight = 56;
        const aspect = logoLoadedImage.width / logoLoadedImage.height;
        const logoWidth = logoHeight * aspect;
        const logoX = isAr ? 1200 - marginX - logoWidth : marginX;
        ctx.drawImage(logoLoadedImage, logoX, topY, logoWidth, logoHeight);
      } else {
        ctx.font = `bold 28px ${boldFont}`;
        ctx.fillStyle = '#0d111d';
        ctx.textAlign = isAr ? 'right' : 'left';
        ctx.fillText(isAr ? 'SHURU' : 'SHURU', isAr ? 1200 - marginX : marginX, topY + 36);
      }

      // Main Content Block
      const contentMaxW = 960;
      const textX = isAr ? 1200 - marginX : marginX;
      ctx.textAlign = isAr ? 'right' : 'left';

      let currentY = 160;

      // Category Pill
      if (displayCategory) {
        ctx.font = `bold 16px ${boldFont}`;
        const catMetrics = ctx.measureText(displayCategory);
        const pillW = catMetrics.width + 36;
        const pillH = 36;
        const pillX = isAr ? textX - pillW : textX;

        ctx.fillStyle = 'rgba(13, 148, 136, 0.1)';
        drawRoundedRect(ctx, pillX, currentY, pillW, pillH, 18);
        ctx.fill();

        ctx.fillStyle = '#0d9488';
        ctx.textAlign = 'center';
        ctx.fillText(displayCategory, pillX + pillW / 2, currentY + 23);

        currentY += pillH + 24;
        ctx.textAlign = isAr ? 'right' : 'left';
      }

      // Title
      ctx.font = `bold 52px ${boldFont}`;
      const titleLines = wrapText(ctx, displayTitle, contentMaxW, 3);
      const titleLineHeight = 64;

      ctx.fillStyle = '#0d111d';
      for (const line of titleLines) {
        ctx.fillText(line, textX, currentY + 40);
        currentY += titleLineHeight;
      }

      // Description
      if (displayDescription) {
        currentY += 12;
        ctx.font = `400 22px ${primaryFont}`;
        const descLines = wrapText(ctx, displayDescription, contentMaxW, 2);
        const descLineHeight = 32;

        ctx.fillStyle = '#334155';
        for (const line of descLines) {
          ctx.fillText(line, textX, currentY + 20);
          currentY += descLineHeight;
        }
      }

      // Footer
      const footerY = 570;
      const barW = 16;
      const barH = 2;

      ctx.fillStyle = '#14b8a6';
      if (isAr) {
        ctx.fillRect(1200 - marginX - barW, footerY - 10, barW, barH);
        ctx.font = `bold 18px ${boldFont}`;
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'right';
        ctx.fillText('shuru.sa', 1200 - marginX - barW - 12, footerY);
      } else {
        ctx.fillRect(marginX, footerY - 10, barW, barH);
        ctx.font = `bold 18px ${boldFont}`;
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'left';
        ctx.fillText('shuru.sa', marginX + barW + 12, footerY);
      }
    }

    const pngBuffer = canvas.toBuffer('image/png');
    return new Response(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('OG Image Generation Error:', error);
    try {
      ensureFontsRegistered();
      const canvas = createCanvas(1200, 630);
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0d111d';
      ctx.fillRect(0, 0, 1200, 630);

      ctx.font = 'bold 64px InterBold, Inter, sans-serif';
      ctx.fillStyle = '#14b8a6';
      ctx.textAlign = 'center';
      ctx.fillText('SHURU', 600, 300);

      ctx.font = '400 24px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('shuru.sa', 600, 350);

      const fallbackBuffer = canvas.toBuffer('image/png');
      return new Response(new Uint8Array(fallbackBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
        },
      });
    } catch (fallbackErr) {
      console.error('Fallback OG Image Generation Error:', fallbackErr);
      return new Response('Failed to generate OG image', { status: 500 });
    }
  }
}
