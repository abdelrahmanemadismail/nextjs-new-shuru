const fs = require('fs');
const path = require('path');
const { createCanvas, GlobalFonts, loadImage } = require('@napi-rs/canvas');

// Register Bahij TheSansArabic fonts used in website Hero
const fontsDir = path.join(__dirname, 'public', 'fonts');
if (fs.existsSync(path.join(fontsDir, 'Bahij_TheSansArabic-Plain.woff2'))) {
  GlobalFonts.registerFromPath(path.join(fontsDir, 'Bahij_TheSansArabic-Plain.woff2'), 'BahijTheSans');
}
if (fs.existsSync(path.join(fontsDir, 'Bahij_TheSansArabic-Bold.woff2'))) {
  GlobalFonts.registerFromPath(path.join(fontsDir, 'Bahij_TheSansArabic-Bold.woff2'), 'BahijTheSansBold');
}
if (fs.existsSync(path.join(fontsDir, 'Bahij_TheSansArabic-SemiBold.woff2'))) {
  GlobalFonts.registerFromPath(path.join(fontsDir, 'Bahij_TheSansArabic-SemiBold.woff2'), 'BahijTheSansSemiBold');
}

if (fs.existsSync(path.join(fontsDir, 'Tajawal-Regular.ttf'))) {
  GlobalFonts.registerFromPath(path.join(fontsDir, 'Tajawal-Regular.ttf'), 'Tajawal');
}
if (fs.existsSync(path.join(fontsDir, 'Tajawal-Bold.ttf'))) {
  GlobalFonts.registerFromPath(path.join(fontsDir, 'Tajawal-Bold.ttf'), 'TajawalBold');
}
if (fs.existsSync(path.join(fontsDir, 'Inter-Regular.ttf'))) {
  GlobalFonts.registerFromPath(path.join(fontsDir, 'Inter-Regular.ttf'), 'Inter');
}
if (fs.existsSync(path.join(fontsDir, 'Inter-Bold.ttf'))) {
  GlobalFonts.registerFromPath(path.join(fontsDir, 'Inter-Bold.ttf'), 'InterBold');
}

function fixRtlPunctuation(line) {
  if (!line) return '';
  let trimmed = line.trim();
  if (/[\.\!\?\:\,\-]$/.test(trimmed) && !trimmed.endsWith('\u200F')) {
    return trimmed + '\u200F';
  }
  return trimmed;
}

function sanitizeTextForOg(text) {
  if (!text) return '';
  let cleaned = text.trim();
  if (!cleaned) return '';

  return cleaned
    .replace(/[\u00AB\u00BB\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u00B7\u25FE\u25FD\u25AA\u25AB\u25CF\u25CB\u25A0\u25A1]/g, ' - ')
    .replace(/[\u2010-\u2015\u2212\u2013\u2014]/gu, '-')
    .replace(/\u2026/g, '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y);
    ctx.arcTo(x, y, x + w, y, r);
  }
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth, maxLines = 4, isRtl = true) {
  if (!text) return [];

  const rawParagraphs = text.split(/\r?\n/);
  const lines = [];

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

async function renderOgHero(titleRaw, descRaw, cta1Raw, cta2Raw, outputPath) {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  const displayTitle = sanitizeTextForOg(titleRaw);
  const displayDescription = sanitizeTextForOg(descRaw);
  const displayCta1 = sanitizeTextForOg(cta1Raw);
  const displayCta2 = sanitizeTextForOg(cta2Raw);

  const isAr = true;
  const primaryFont = 'BahijTheSans, Tajawal, Inter, sans-serif';
  const boldFont = 'BahijTheSansBold, BahijTheSans, TajawalBold, Tajawal, InterBold, Inter, sans-serif';

  // Fill Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 1200, 630);

  // Top-Center Soft Ambient Glow
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

  // Load Header Logo
  let logoLoadedImage = null;
  const logoPath = path.join(process.cwd(), 'public', 'شعار بدون خلفية-04.png');
  if (fs.existsSync(logoPath)) {
    try {
      logoLoadedImage = await loadImage(logoPath);
    } catch (e) {}
  }

  // Load Background Watermark Icon ONLY (web-app-manifest-512x512.png)
  let watermarkIconImage = null;
  const iconPath = path.join(process.cwd(), 'public', 'web-app-manifest-512x512.png');
  if (fs.existsSync(iconPath)) {
    try {
      watermarkIconImage = await loadImage(iconPath);
    } catch (e) {}
  }

  // Draw Icon Watermark
  if (watermarkIconImage) {
    ctx.save();
    ctx.globalAlpha = 0.07;
    const wmSize = 420;
    const wmX = (1200 - wmSize) / 2;
    const wmY = (630 - wmSize) / 2 + 15;
    ctx.drawImage(watermarkIconImage, wmX, wmY, wmSize, wmSize);
    ctx.restore();
  }

  // Header Logo
  const topY = 32;

  if (logoLoadedImage) {
    const logoHeight = 110;
    const aspect = logoLoadedImage.width / logoLoadedImage.height;
    const logoWidth = Math.min(logoHeight * aspect, 560);
    const logoX = (1200 - logoWidth) / 2;
    ctx.drawImage(logoLoadedImage, logoX, topY, logoWidth, logoHeight);
  } else {
    ctx.font = `bold 42px ${boldFont}`;
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('شروع SHURU', 600, topY + 54);
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

  // Moved startY down to 185 to give clear spacing below logo bottom (y = 142)
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

    ctx.font = `bold 20px ${boldFont}`;
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

  const scratchDir = 'C:\\Users\\abdel\\.gemini\\antigravity-ide\\brain\\3fbed3c2-47db-42d6-ba5c-fea3a200636a';
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(scratchDir, outputPath), buffer);
  console.log('Saved rendered image to:', path.join(scratchDir, outputPath));
}

renderOgHero(
  'نحوّل المعرفة إلى قرارات وتنفيذ أذكى.',
  'منصة تنفيذ ذكي تجمع المعرفة المؤسسية، والذكاء الاصطناعي، وأفضل ممارسات إدارة المشاريع.\nلتمكين القيادات من اتخاذ قرارات أوضح وتحقيق نتائج أكثر قابلية للتنبؤ.',
  'استعرض الحلول',
  'تواصل معنا',
  'test_icon_watermark_spacing.png'
);
