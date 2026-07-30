import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const dynamic = 'force-dynamic';

let browserInstance: any = null;

async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  let executablePath: string | undefined;

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    executablePath = await chromium.executablePath();
  } else {
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.CHROME_PATH,
    ].filter(Boolean) as string[];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        executablePath = p;
        break;
      }
    }

    if (!executablePath) {
      executablePath = await chromium.executablePath();
    }
  }

  let chromeArgs: string[] = [];
  try {
    const rawArgs = await chromium.args;
    chromeArgs = Array.isArray(rawArgs) ? rawArgs : [];
  } catch (e) {
    chromeArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
  }

  browserInstance = await puppeteer.launch({
    args: [...chromeArgs, '--font-render-hinting=none', '--no-first-run'],
    defaultViewport: { width: 1200, height: 630 },
    executablePath,
    headless: true,
  });

  return browserInstance;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'insight'; // 'hero' | 'insight'
    let title = searchParams.get('title') || '';
    let description = searchParams.get('description') || '';
    let cta1 = searchParams.get('cta1') || '';
    let cta2 = searchParams.get('cta2') || '';
    const category = searchParams.get('category') || '';
    const locale = (searchParams.get('locale') || 'ar') as 'ar' | 'en';
    const isAr = locale === 'ar';

    // If type === 'hero' and key params missing, fetch Strapi home content server-side as fallback
    if (type === 'hero' && (!title || !cta1)) {
      try {
        const { getHomeCached } = await import('@/strapi/home');
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
        console.error('Failed to fetch fallback hero data from Strapi:', e);
      }
    }

    if (!title) {
      title = 'Shuru';
    }

    // Prepare HTML template for Chromium rendering
    const html = `
<!DOCTYPE html>
<html lang="${locale}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 630px;
      background-color: ${type === 'hero' ? '#f8fafc' : '#f6f6f6'};
      font-family: ${isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif"};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 80px;
      overflow: hidden;
      direction: ${isAr ? 'rtl' : 'ltr'};
      text-align: ${isAr ? 'right' : 'left'};
      position: relative;
    }

    /* Soft Glow Background */
    .glow-bg {
      position: absolute;
      top: -120px;
      ${isAr ? 'right: -120px;' : 'left: -120px;'}
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(20, 184, 166, 0) 70%);
      pointer-events: none;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      z-index: 10;
    }

    .category-badge {
      display: inline-flex;
      align-items: center;
      background-color: rgba(13, 148, 136, 0.1);
      color: #0d9488;
      font-size: 16px;
      font-weight: 700;
      padding: 8px 18px;
      border-radius: 9999px;
      margin-bottom: 20px;
      width: fit-content;
    }

    .content-box {
      display: flex;
      flex-direction: column;
      align-items: ${isAr ? 'flex-start' : 'flex-start'};
      margin: auto 0;
      max-width: 1040px;
      z-index: 10;
    }

    h1 {
      font-size: ${type === 'hero' ? '48px' : '52px'};
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
      margin-bottom: 20px;
      text-align: ${isAr ? 'right' : 'left'};
    }

    p {
      font-size: ${type === 'hero' ? '20px' : '22px'};
      font-weight: 400;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 32px;
      max-width: 960px;
      text-align: ${isAr ? 'right' : 'left'};
    }

    .cta-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 16px;
    }

    .cta-primary {
      background-color: #0d9488;
      color: #ffffff;
      font-size: 18px;
      font-weight: 700;
      padding: 14px 32px;
      border-radius: 9999px;
    }

    .cta-secondary {
      border: 1px solid #cbd5e1;
      background-color: rgba(255, 255, 255, 0.8);
      color: #334155;
      font-size: 18px;
      font-weight: 700;
      padding: 14px 30px;
      border-radius: 9999px;
    }

    .footer {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 700;
      color: #64748b;
      z-index: 10;
    }

    .footer-line {
      width: 16px;
      height: 2px;
      background-color: #0d9488;
    }
  </style>
</head>
<body>
  <div class="glow-bg"></div>

  <div class="brand-logo">
    <span>${isAr ? 'شروع SHURU' : 'SHURU'}</span>
  </div>

  <div class="content-box">
    ${category ? `<div class="category-badge">${category}</div>` : ''}
    <h1>${title}</h1>
    ${description ? `<p>${description}</p>` : ''}
    ${(cta1 || cta2) ? `
      <div class="cta-container">
        ${cta1 ? `<div class="cta-primary">${cta1}</div>` : ''}
        ${cta2 ? `<div class="cta-secondary">${cta2}</div>` : ''}
      </div>
    ` : ''}
  </div>

  <div class="footer">
    <span>shuru.sa</span>
    <div class="footer-line"></div>
  </div>
</body>
</html>
    `;

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const imageBuffer = await page.screenshot({ type: 'png' });
    await page.close();

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('OG Image Generation Error via Chromium:', error);
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
