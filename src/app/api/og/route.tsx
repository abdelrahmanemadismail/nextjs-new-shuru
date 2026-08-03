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

  const fontFiles = [
    { file: 'Bahij_TheSansArabic-Plain.woff2', name: 'BahijTheSans' },
    { file: 'Bahij_TheSansArabic-Bold.woff2', name: 'BahijTheSansBold' },
    { file: 'Bahij_TheSansArabic-SemiBold.woff2', name: 'BahijTheSansSemiBold' },
    { file: 'Tajawal-Regular.ttf', name: 'Tajawal' },
    { file: 'Tajawal-Bold.ttf', name: 'TajawalBold' },
    { file: 'Inter-Regular.ttf', name: 'Inter' },
    { file: 'Inter-Bold.ttf', name: 'InterBold' },
  ];

  for (const font of fontFiles) {
    const fontPath = path.join(fontsDir, font.file);
    if (fs.existsSync(fontPath)) {
      try {
        GlobalFonts.registerFromPath(fontPath, font.name);
      } catch (e) {
        console.error(`Failed to register font ${font.name} from ${font.file}:`, e);
      }
    }
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

function fixRtlPunctuation(line: string): string {
  if (!line) return '';
  let trimmed = line.trim();
  if (/[\.\!\?\:\,\-]$/.test(trimmed) && !trimmed.endsWith('\u200F')) {
    return trimmed + '\u200F';
  }
  return trimmed;
}

function wrapText(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 4,
  isRtl: boolean = true
): string[] {
  if (!text) return [];

  const rawParagraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of rawParagraphs) {
    const trimmedPara = paragraph.trim();
    if (!trimmedPara) continue;

    const words = trimmedPara.split(/\s+/);
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        const formattedLine = isRtl ? fixRtlPunctuation(currentLine) : currentLine.trim();
        lines.push(formattedLine);
        currentLine = word;

        if (lines.length >= maxLines) {
          return lines.filter((l) => l.length > 0);
        }
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine && lines.length < maxLines) {
      const formattedLine = isRtl ? fixRtlPunctuation(currentLine) : currentLine.trim();
      lines.push(formattedLine);
    }

    if (lines.length >= maxLines) {
      break;
    }
  }

  return lines.filter((l) => l.length > 0);
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
          title = heroBlock.title || title;
          description = heroBlock.subtitle || description;
          cta1 = heroBlock.primaryCtaText || cta1;
          cta2 = heroBlock.secondaryCtaText || cta2;
          if (heroBlock.image) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(heroBlock.image));
          }
        } else if (homeData?.seo?.og_image) {
          rawCoverUrl = toAbsoluteUrl(extractMediaUrl(homeData.seo.og_image));
          if (!title && homeData.seo.meta_title) title = homeData.seo.meta_title;
          if (!description && homeData.seo.meta_description) description = homeData.seo.meta_description;
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
      title = isAr ? 'شروع – شريك التنفيذ الذكي والتحول التشغيلي' : 'SHURU – Smart Execution & Operational Transformation';
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
        const strapiLogo = headerSettings?.lightLogoUrl || headerSettings?.darkLogoUrl;
        if (strapiLogo) {
          logoBuffer = await fetchImageAsBuffer(strapiLogo);
        }
      } catch (e) {
        console.error('Failed to load header logo from Strapi:', e);
      }
    }

    if (!logoBuffer) {
      try {
        const logoPathPrimary = path.join(process.cwd(), 'public', 'شعار بدون خلفية-01.png');
        const logoPathSecondary = path.join(process.cwd(), 'public', 'شعار بدون خلفية-04.png');
        if (fs.existsSync(logoPathPrimary)) {
          logoBuffer = fs.readFileSync(logoPathPrimary);
        } else if (fs.existsSync(logoPathSecondary)) {
          logoBuffer = fs.readFileSync(logoPathSecondary);
        }
      } catch (e) {
        console.error('Failed to load local brand logo:', e);
      }
    }

    let watermarkIconBuffer: Buffer | null = null;
    try {
      const iconPath = path.join(process.cwd(), 'public', 'web-app-manifest-512x512.png');
      if (fs.existsSync(iconPath)) {
        watermarkIconBuffer = fs.readFileSync(iconPath);
      }
    } catch (e) {
      console.error('Failed to load watermark icon buffer:', e);
    }

    // 5. Create Canvas (1200 x 630)
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const primaryFont = isAr ? 'BahijTheSans, Tajawal, Inter, sans-serif' : 'Inter, sans-serif';
    const boldFont = isAr ? 'BahijTheSansBold, BahijTheSans, TajawalBold, Tajawal, InterBold, Inter, sans-serif' : 'InterBold, Inter, sans-serif';

    // HERO CARD RENDER (Centered Layout matching website Hero)
    if (type === 'hero') {
      // Fill Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1200, 630);

      // Top-Center Soft Ambient Glow (matching website Hero top gradient)
      const glowX = 600;
      const glowY = 0;
      const gradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 650);
      gradient.addColorStop(0, 'rgba(13, 148, 136, 0.15)');
      gradient.addColorStop(0.6, 'rgba(13, 148, 136, 0.04)');
      gradient.addColorStop(1, 'rgba(13, 148, 136, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(glowX, glowY, 650, 0, Math.PI * 2);
      ctx.fill();

      // Header Logo (Top-Center)
      let logoLoadedImage = null;
      if (logoBuffer) {
        try {
          logoLoadedImage = await loadImage(logoBuffer);
        } catch (e) {
          console.error('Failed to parse logo image buffer for canvas:', e);
        }
      }

      // Background Watermark Icon (using web-app-manifest-512x512.png)
      let watermarkImage = null;
      if (watermarkIconBuffer) {
        try {
          watermarkImage = await loadImage(watermarkIconBuffer);
        } catch (e) {}
      }
      if (!watermarkImage && logoLoadedImage) {
        watermarkImage = logoLoadedImage;
      }

      if (watermarkImage) {
        ctx.save();
        ctx.globalAlpha = 0.05;
        const maxWm = 360;
        const wmAspect = watermarkImage.width / watermarkImage.height;
        let wmW = maxWm;
        let wmH = maxWm / wmAspect;
        if (wmH > maxWm) {
          wmH = maxWm;
          wmW = wmH * wmAspect;
        }
        const wmX = (1200 - wmW) / 2;
        const wmY = (630 - wmH) / 2 + 15;
        ctx.drawImage(watermarkImage, wmX, wmY, wmW, wmH);
        ctx.restore();
      }

      const topY = 32;

      if (logoLoadedImage) {
        const aspect = logoLoadedImage.width / logoLoadedImage.height;
        const maxH = 95;
        const maxW = 480;

        let logoHeight = maxH;
        let logoWidth = logoHeight * aspect;

        if (logoWidth > maxW) {
          logoWidth = maxW;
          logoHeight = logoWidth / aspect;
        }

        const logoX = (1200 - logoWidth) / 2;
        const logoY = topY + (maxH - logoHeight) / 2;
        ctx.drawImage(logoLoadedImage, logoX, logoY, logoWidth, logoHeight);
      } else {
        ctx.font = `bold 42px ${boldFont}`;
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(isAr ? 'شروع SHURU' : 'SHURU', 600, topY + 54);
      }

      // Title & Description (Centered under logo with generous breathing room)
      const contentMaxW = 1000;
      ctx.textAlign = 'center';

      ctx.font = `bold 52px ${boldFont}`;
      const titleLines = wrapText(ctx, displayTitle, contentMaxW, 2, isAr);

      ctx.font = `400 24px ${primaryFont}`;
      const descLines = displayDescription ? wrapText(ctx, displayDescription, contentMaxW, 4, isAr) : [];

      const titleLineHeight = 68;
      const descLineHeight = 36;
      const ctaHeight = (displayCta1 || displayCta2) ? 52 : 0;
      const contentBlockHeight =
        titleLines.length * titleLineHeight +
        (descLines.length > 0 ? descLines.length * descLineHeight + 20 : 0) +
        (ctaHeight > 0 ? ctaHeight + 32 : 0);

      const startY = 185 + Math.max(0, (320 - contentBlockHeight) / 2);
      let currentY = startY;

      // Draw Centered Title
      ctx.font = `bold 52px ${boldFont}`;
      ctx.fillStyle = '#0f172a';
      for (const line of titleLines) {
        ctx.fillText(line, 600, currentY);
        currentY += titleLineHeight;
      }

      // Draw Centered Description
      if (descLines.length > 0) {
        currentY += 8;
        ctx.font = `400 24px ${primaryFont}`;
        ctx.fillStyle = '#64748b';
        for (const line of descLines) {
          ctx.fillText(line, 600, currentY);
          currentY += descLineHeight;
        }
      }

      // Draw Centered CTAs
      if (displayCta1 || displayCta2) {
        currentY += 24;

        ctx.font = `500 19px ${primaryFont}`;
        const cta1W = displayCta1 ? ctx.measureText(displayCta1).width + 68 : 0;
        const cta2W = displayCta2 ? ctx.measureText(displayCta2).width + 64 : 0;
        const btnH = 52;
        const spacing = 16;
        const totalW = cta1W + (cta1W && cta2W ? spacing : 0) + cta2W;

        let startBtnX = isAr ? 600 + totalW / 2 : 600 - totalW / 2;

        if (displayCta1) {
          const rectX = isAr ? startBtnX - cta1W : startBtnX;

          ctx.fillStyle = '#0d9488';
          drawRoundedRect(ctx, rectX, currentY, cta1W, btnH, 26);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(displayCta1, rectX + cta1W / 2, currentY + 33);

          if (isAr) {
            startBtnX -= cta1W + spacing;
          } else {
            startBtnX += cta1W + spacing;
          }
        }

        if (displayCta2) {
          const rectX = isAr ? startBtnX - cta2W : startBtnX;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          drawRoundedRect(ctx, rectX, currentY, cta2W, btnH, 26);
          ctx.fill();

          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          drawRoundedRect(ctx, rectX, currentY, cta2W, btnH, 26);
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'center';
          ctx.fillText(displayCta2, rectX + cta2W / 2, currentY + 33);
        }
      }

      // Footer Centered
      const footerY = 580;
      const barW = 24;
      const barH = 2;

      ctx.fillStyle = '#0d9488';
      ctx.fillRect(600 - barW / 2, footerY - 14, barW, barH);
      ctx.font = `bold 18px InterBold, Inter, sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('shuru.sa', 600, footerY + 10);
    } else {
      // INSIGHT / ARTICLE / DEFAULT CARD RENDER (Centered Layout)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1200, 630);

      // Top-Center Ambient Glow
      const glowX = 600;
      const glowY = 0;
      const gradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 650);
      gradient.addColorStop(0, 'rgba(13, 148, 136, 0.12)');
      gradient.addColorStop(0.6, 'rgba(13, 148, 136, 0.03)');
      gradient.addColorStop(1, 'rgba(13, 148, 136, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(glowX, glowY, 650, 0, Math.PI * 2);
      ctx.fill();

      // Header Logo (Top-Center)
      let logoLoadedImage = null;
      if (logoBuffer) {
        try {
          logoLoadedImage = await loadImage(logoBuffer);
        } catch (e) {
          console.error('Failed to parse logo image buffer for canvas:', e);
        }
      }

      // Background Watermark Icon (using web-app-manifest-512x512.png)
      let watermarkImage = null;
      if (watermarkIconBuffer) {
        try {
          watermarkImage = await loadImage(watermarkIconBuffer);
        } catch (e) {}
      }
      if (!watermarkImage && logoLoadedImage) {
        watermarkImage = logoLoadedImage;
      }

      if (watermarkImage) {
        ctx.save();
        ctx.globalAlpha = 0.05;
        const maxWm = 360;
        const wmAspect = watermarkImage.width / watermarkImage.height;
        let wmW = maxWm;
        let wmH = maxWm / wmAspect;
        if (wmH > maxWm) {
          wmH = maxWm;
          wmW = wmH * wmAspect;
        }
        const wmX = (1200 - wmW) / 2;
        const wmY = (630 - wmH) / 2 + 15;
        ctx.drawImage(watermarkImage, wmX, wmY, wmW, wmH);
        ctx.restore();
      }

      const topY = 32;

      if (logoLoadedImage) {
        const aspect = logoLoadedImage.width / logoLoadedImage.height;
        const maxH = 95;
        const maxW = 480;

        let logoHeight = maxH;
        let logoWidth = logoHeight * aspect;

        if (logoWidth > maxW) {
          logoWidth = maxW;
          logoHeight = logoWidth / aspect;
        }

        const logoX = (1200 - logoWidth) / 2;
        const logoY = topY + (maxH - logoHeight) / 2;
        ctx.drawImage(logoLoadedImage, logoX, logoY, logoWidth, logoHeight);
      } else {
        ctx.font = `bold 42px ${boldFont}`;
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(isAr ? 'SHURU' : 'SHURU', 600, topY + 54);
      }

      // Main Content Block Centered
      const contentMaxW = 1000;
      ctx.textAlign = 'center';

      let currentY = 175;

      // Category Pill Centered
      if (displayCategory) {
        ctx.font = `bold 18px ${boldFont}`;
        const catMetrics = ctx.measureText(displayCategory);
        const pillW = catMetrics.width + 44;
        const pillH = 40;
        const pillX = 600 - pillW / 2;

        ctx.fillStyle = 'rgba(13, 148, 136, 0.1)';
        drawRoundedRect(ctx, pillX, currentY, pillW, pillH, 20);
        ctx.fill();

        ctx.strokeStyle = 'rgba(13, 148, 136, 0.25)';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, pillX, currentY, pillW, pillH, 20);
        ctx.stroke();

        ctx.fillStyle = '#0d9488';
        ctx.textAlign = 'center';
        ctx.fillText(displayCategory, 600, currentY + 26);

        currentY += pillH + 24;
      }

      // Title Centered
      ctx.font = `bold 56px ${boldFont}`;
      const titleLines = wrapText(ctx, displayTitle, contentMaxW, 3, isAr);
      const titleLineHeight = 70;

      ctx.fillStyle = '#0f172a';
      for (const line of titleLines) {
        ctx.fillText(line, 600, currentY + 44);
        currentY += titleLineHeight;
      }

      // Description Centered
      if (displayDescription) {
        currentY += 12;
        ctx.font = `400 24px ${primaryFont}`;
        const descLines = wrapText(ctx, displayDescription, contentMaxW, 4, isAr);
        const descLineHeight = 36;

        ctx.fillStyle = '#64748b';
        for (const line of descLines) {
          ctx.fillText(line, 600, currentY + 20);
          currentY += descLineHeight;
        }
      }

      // Footer Centered
      const footerY = 575;
      const barW = 24;
      const barH = 2;

      ctx.fillStyle = '#0d9488';
      ctx.fillRect(600 - barW / 2, footerY - 14, barW, barH);
      ctx.font = `bold 18px InterBold, Inter, sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('shuru.sa', 600, footerY + 10);
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
